/*
 * zkPassClient.ts
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: November 29th 2023
 * -----
 * Last Modified: May 6th 2024
 * Modified By: GDPWinnerPranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import {
  JWTVerifyResult as JwtVerifyResult,
  JWTDecryptResult as JwtDecryptResult,
  SignJWT as SignJwt,
  importPKCS8 as importPkcs8,
  jwtVerify,
  importSPKI as importSpki,
  EncryptJWT as EncryptJwt,
  jwtDecrypt,
} from "jose";
import {
  ZkPassProofGenerator,
  ZkPassProofVerifier,
  ZkPassUtility,
} from "../interfaces";
import {
  Primitive,
  KeysetEndpoint,
  QueryEngineVersionInfo,
  ZkPassProof,
  VerifyZkPassProofResult,
  ProofPayload,
} from "../types";
import { InvalidZkVm, JoseError, MissingApiKey } from "../errors";
import { ZkPassApiKey } from "./zkPassApiKey";
import { ZkPassFfiR0 } from "./zkPassFfiR0";
import { ZkPassFfiSp1 } from "./zkPassFfiSp1";
import { zkPassPubToSpki } from "../helpers/keys";

const DEFAULT_TIMEOUT = 60;

export class ZkPassClient
  extends ZkPassProofVerifier
  implements ZkPassUtility, ZkPassProofGenerator
{
  private readonly zkPassServiceUrl: string;
  private readonly zkPassApiKey?: ZkPassApiKey;
  private readonly zkVm: string;
  private readonly ffiWrapper;

  constructor(args: {
    zkPassServiceUrl: string;
    zkPassApiKey?: ZkPassApiKey;
    zkVm: string;
  }) {
    super();
    this.zkPassServiceUrl = args.zkPassServiceUrl;
    this.zkPassApiKey = args.zkPassApiKey;
    this.zkVm = args.zkVm;
    this.ffiWrapper = this.getFfiWrapper();
  }

  private getFfiWrapper() {
    switch (this.zkVm) {
      case "r0":
        return new ZkPassFfiR0();
      case "sp1":
        return new ZkPassFfiSp1();
    }
  }

  getApiToken() {
    const apiKey = this.zkPassApiKey;
    if (!apiKey) throw new MissingApiKey();

    return apiKey.getApiToken();
  }

  getEncryptionKey(): Promise<string> {
    return this.getKeys().then((keys) => keys.ServiceEncryptionPubK);
  }

  getVerifyingKey(): Promise<string> {
    return this.getKeys().then((keys) => keys.ServiceSigningPubK);
  }

  async signDataToJwsToken(
    signingKey: string,
    data: Primitive,
    verifyingKeyJwks?: KeysetEndpoint
  ): Promise<string> {
    const privateKey = await importPkcs8(signingKey, "ES256");
    try {
      return await new SignJwt({ data })
        .setProtectedHeader({
          alg: "ES256",
          jku: verifyingKeyJwks?.jku,
          kid: verifyingKeyJwks?.kid,
        })
        .sign(privateKey);
    } catch (e) {
      throw e as JoseError;
    }
  }

  async verifyJwsToken(
    key: string,
    jwsToken: string
  ): Promise<JwtVerifyResult> {
    const publicKey = await importSpki(key, "ES256");
    try {
      return await jwtVerify(jwsToken, publicKey);
    } catch (e) {
      throw e as JoseError;
    }
  }

  async encryptDataToJweToken(key: string, data: Primitive): Promise<string> {
    const staticKey = await importSpki(key, "ES256");
    try {
      return await new EncryptJwt({ data })
        .setProtectedHeader({
          alg: "ECDH-ES",
          enc: "A256GCM",
        })
        .encrypt(staticKey);
    } catch (e) {
      throw e as JoseError;
    }
  }

  async decryptJweToken(
    key: string,
    jweToken: string
  ): Promise<JwtDecryptResult> {
    const privateKey = await importPkcs8(key, "ES256");
    try {
      return await jwtDecrypt(jweToken, privateKey);
    } catch (e) {
      throw e as JoseError;
    }
  }

  async generateZkPassProof(
    userDataToken: string,
    dvrToken: string
  ): Promise<string> {
    const pem = await this.getEncryptionKey();

    const [encryptedUserData, encryptedDvr] = await Promise.all([
      this.encryptDataToJweToken(pem, userDataToken),
      this.encryptDataToJweToken(pem, dvrToken),
    ]);

    const payload = JSON.stringify({
      user_data_token: encryptedUserData,
      dvr_token: encryptedDvr,
    });

    const apiKeyToken = this.getApiToken();

    const endpoint = `${this.zkPassServiceUrl}/v1/proof`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Basic ${apiKeyToken}`,
      },
      body: payload,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT * 1000),
    });

    const responseBody = await response.json();
    if (response.status !== 200)
      throw new Error(
        `${responseBody.status} ${responseBody.status_code}: ${responseBody.status_text}`
      );
    return responseBody.proof;
  }

  async verifyZkPassProofInternal(
    zkPassProofToken: string
  ): Promise<VerifyZkPassProofResult> {
    if (!this.ffiWrapper) throw new InvalidZkVm();
    const zkPassProofVerifyingKey = await this.getVerifyingKey();

    const { payload } = await this.verifyJwsToken(
      zkPassProofVerifyingKey,
      zkPassProofToken
    );
    const zkPassProof = payload as ProofPayload;
    const {
      dvr_digest: dvrDigest,
      dvr_id: dvrId,
      dvr_title: dvrTitle,
      dvr_verifying_key: dvrVerifyingKey,
      time_stamp: timestamp,
      user_data_verifying_key: userDataVerifyingKey,
      zkproof: zkProof,
    } = zkPassProof.data;

    const output = this.ffiWrapper.verifyZkProof(zkProof);

    return {
      output,
      zkPassProof: {
        zkProof,
        dvrId,
        dvrTitle,
        dvrDigest,
        userDataVerifyingKey,
        dvrVerifyingKey,
        timestamp,
      } as ZkPassProof,
    };
  }

  async getQueryEngineVersionInfo(): Promise<QueryEngineVersionInfo> {
    if (!this.ffiWrapper) throw new InvalidZkVm();
    const queryEngineVersionInfo: QueryEngineVersionInfo = {
      queryEngineVersion: this.ffiWrapper.getQueryEngineVersion(),
      queryMethodVersion: this.ffiWrapper.getQueryMethodVersion(),
    };
    return queryEngineVersionInfo;
  }

  private async getKeys(): Promise<Keys> {
    // Fetch all keys
    const keyUrl = `${this.zkPassServiceUrl}/.well-known/jwks.json`;
    const fetchKeys = await fetch(keyUrl);
    if (fetchKeys.status !== 200)
      throw new Error(`${fetchKeys.status}: ${fetchKeys.statusText}`);

    const keys = await fetchKeys.json();

    // Get & Master verifying key
    const verifierKey = keys.find(
      (key: { kid: string }) => key.kid === "VerifyingPubK"
    );
    if (!verifierKey) throw new Error("VerifyingPubK not found");
    const vkPem = zkPassPubToSpki(verifierKey);
    const vk = await importSpki(vkPem, "ES256").catch(() => {
      throw new JoseError("Invalid JWK format for VerifyingPubK");
    });

    // Get & Verify Service signing public key
    const signingPub = keys.find(
      (key: { kid: string }) => key.kid === "ServiceSigningPubK"
    );
    if (!signingPub) throw new Error("ServiceSigningPubK not found");
    const signJwt = signingPub.jwt;
    const signKey = await jwtVerify(signJwt, vk).catch(() => {
      throw new JoseError(
        "Invalid JWT format / signature for ServiceSigningPubK"
      );
    });

    // Get & Verify Service encryption public key
    const encryptionPub = keys.find(
      (key: { kid: string }) => key.kid === "ServiceEncryptionPubK"
    );
    if (!encryptionPub) throw new Error("ServiceEncryptionPubK not found");
    const encryptionJwt = encryptionPub.jwt;
    const encryptionKey = await jwtVerify(encryptionJwt, vk).catch(() => {
      throw new JoseError(
        "Invalid JWT format / signature for ServiceEncryptionPubK"
      );
    });

    return {
      ServiceSigningPubK: zkPassPubToSpki(
        signKey.payload as { x: string; y: string }
      ),
      ServiceEncryptionPubK: zkPassPubToSpki(
        encryptionKey.payload as { x: string; y: string }
      ),
    };
  }
}

type Keys = {
  ServiceSigningPubK: string;
  ServiceEncryptionPubK: string;
};
