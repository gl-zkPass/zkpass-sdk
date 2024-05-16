/*
 * zkPassClient.ts
 * Main source code of zkpass-client-react-native
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: October 23rd 2023
 * -----
 * Last Modified: May 6th 2024
 * Modified By: GDPWinnerPranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { ZkPassProofGenerator, ZkPassUtility } from '../interfaces';
import { KeysetEndpoint } from '../types';
import { JoseError, MissingApiKey } from '../errors';
import { ZkPassApiKey } from './zkPassApiKey';
import { zkPassPubToSpki } from '../helpers/keys';
import { NativeModules, Platform } from 'react-native';
import { StatusCodes } from 'http-status-codes';

const LINKING_ERROR =
  `The package '@didpass/zkpass-client-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';
const DEFAULT_TIMEOUT = 60;

const ZkPassJwtUtility =
  NativeModules.ZkPassJwtUtility ??
  new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

export class ZkPassClient implements ZkPassUtility, ZkPassProofGenerator {
  private readonly zkPassServiceUrl: string;
  private readonly zkPassApiKey?: ZkPassApiKey;

  constructor(args: { zkPassServiceUrl: string; zkPassApiKey?: ZkPassApiKey }) {
    this.zkPassServiceUrl = args.zkPassServiceUrl;
    this.zkPassApiKey = args.zkPassApiKey;
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
    key: string,
    value: unknown,
    verifyingKeyJwks?: KeysetEndpoint
  ): Promise<string> {
    const vk = verifyingKeyJwks ? JSON.stringify(verifyingKeyJwks) : '';
    let payload: string;
    try {
      payload = JSON.stringify({ data: JSON.parse(value as string) });
    } catch (_) {
      payload = JSON.stringify({ data: value });
    }

    return await ZkPassJwtUtility.sign(key, payload, vk);
  }

  async verifyJwsToken(key: string, jws: string): Promise<string> {
    const verificationResult = await ZkPassJwtUtility.verify(key, jws);
    const resJson = JSON.parse(verificationResult);
    if (resJson.data) return JSON.stringify(resJson.data);
    return verificationResult;
  }

  async encryptDataToJweToken(key: string, data: unknown): Promise<string> {
    let payload: string;
    try {
      payload = JSON.stringify({ data: JSON.parse(data as string) });
    } catch (_) {
      payload = JSON.stringify({ data: data });
    }

    return await ZkPassJwtUtility.encrypt(key, payload);
  }

  async decryptJweToken(key: string, jwe: string): Promise<string> {
    const decryptionResult = await ZkPassJwtUtility.decrypt(key, jwe);
    const resJson = JSON.parse(decryptionResult);
    if (resJson.data) return JSON.stringify(resJson.data);
    return decryptionResult;
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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Basic ${apiKeyToken}`,
      },
      body: payload,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT * 1000),
    });

    const responseBody = await response.json();
    if (response.status !== StatusCodes.OK)
      throw new Error(
        `${responseBody.status} ${responseBody.status_code}: ${responseBody.status_text}`
      );
    return responseBody.proof;
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
      (key: { kid: string }) => key.kid === 'VerifyingPubK'
    );
    if (!verifierKey) throw new Error('VerifyingPubK not found');
    const vkPem = zkPassPubToSpki(verifierKey);

    // Get & Verify Service signing public key
    const signingPub = keys.find(
      (key: { kid: string }) => key.kid === 'ServiceSigningPubK'
    );
    if (!signingPub) throw new Error('ServiceSigningPubK not found');
    const signJwt = signingPub.jwt;
    let signKey;
    try {
      signKey = await this.verifyJwsToken(vkPem, signJwt);
    } catch (e) {
      throw new JoseError(
        'Invalid JWT format / signature for ServiceSigningPubK'
      );
    }

    // Get & Verify Service encryption public key
    const encryptionPub = keys.find(
      (key: { kid: string }) => key.kid === 'ServiceEncryptionPubK'
    );
    if (!encryptionPub) throw new Error('ServiceEncryptionPubK not found');
    const encryptionJwt = encryptionPub.jwt;

    let encryptionKey;
    try {
      encryptionKey = await this.verifyJwsToken(vkPem, encryptionJwt);
    } catch (e) {
      throw new JoseError(
        'Invalid JWT format / signature for ServiceEncryptionPubK'
      );
    }

    return {
      ServiceSigningPubK: zkPassPubToSpki(JSON.parse(signKey)),
      ServiceEncryptionPubK: zkPassPubToSpki(JSON.parse(encryptionKey)),
    };
  }
}

type Keys = {
  ServiceSigningPubK: string;
  ServiceEncryptionPubK: string;
};
