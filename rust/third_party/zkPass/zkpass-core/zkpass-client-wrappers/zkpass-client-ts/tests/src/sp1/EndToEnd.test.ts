/*
 * EndToEnd.test.ts
 * zkPass-ts-client end to end testing.
 *
 * Authors:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 * Created at: December 29st 2023
 * -----
 * Last Modified: April 23rd 2024
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 *   zulamdat (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import {
  DataVerificationRequest,
  QueryEngineVersionInfo,
  ZkPassApiKey,
  ZkPassClient,
  ZkPassProofMetadataValidator,
} from "../../../src";
import { ZKPASS_SERVICE_KEYS } from "../../resources/zkPassServiceKeys";
import MockDvrValidator from "../../resources/sp1/mockDvrValidator";
import RealDvrValidator from "../../resources/sp1/realDvrValidator";
import {
  privateKeyVerifier,
  verifyingKeyJwksVerifier,
  privateKeyIssuer,
  verifyingKeyJwksIssuer,
} from "../../resources/sp1/variables/keys";
import { proofToken } from "../../resources/sp1/variables/zkProofTrue";
import { mockFetchResponse } from "../common/mock";
require("dotenv-flow").config();

const testTimeout = process.env.TEST_TIMEOUT_MS
  ? Number(process.env.TEST_TIMEOUT_MS)
  : 60000;

describe("end to end testing", () => {
  let zkPassUrl: string;
  let zkPassClient: ZkPassClient;
  let isUsingProductionWs: boolean;
  let newUserData: any;
  let zkPassApiKey: string;
  let zkPassApiSecret: string;
  let expectedApiKeyEncoded: string;
  let originalFetch: any;
  let queryEngineVersionInfo: QueryEngineVersionInfo;
  beforeAll(async () => {
    zkPassUrl = process.env.ZKPASS_WS_URL
      ? process.env.ZKPASS_WS_URL
      : "https://staging-zkpass.ssi.id";
    isUsingProductionWs = process.env.IS_USING_PRODUCTION_WS
      ? process.env.IS_USING_PRODUCTION_WS === "true"
      : false;
    zkPassApiKey = process.env.ZKPASS_API_KEY ? process.env.ZKPASS_API_KEY : "";
    zkPassApiSecret = process.env.ZKPASS_API_SECRET
      ? process.env.ZKPASS_API_SECRET
      : "";
    const apiKey = new ZkPassApiKey(zkPassApiKey, zkPassApiSecret);
    zkPassClient = new ZkPassClient({
      zkPassServiceUrl: zkPassUrl,
      zkPassApiKey: apiKey,
      zkVm: "sp1",
    });
    expectedApiKeyEncoded = Buffer.from(
      `${zkPassApiKey}:${zkPassApiSecret}`
    ).toString("base64");
    newUserData = {
      name: "Ramana",
      _name_zkpass_public_: true,
      email: "ramana@example.com",
      city: "Jakarta",
      country: "Indonesia",
      skills: ["Rust", "JavaScript", "HTML/CSS"],
    };
    originalFetch = global.fetch;
    queryEngineVersionInfo = await zkPassClient.getQueryEngineVersionInfo();
  });

  beforeEach(() => {
    if (!isUsingProductionWs) {
      global.fetch = mockFetchResponse({
        [`${zkPassUrl}/v1/proof`]: {
          body: {
            proof: proofToken,
          },
          statusCode: 200,
        },
        [`${zkPassUrl}/.well-known/jwks.json`]: {
          body: ZKPASS_SERVICE_KEYS,
          statusCode: 200,
        },
      });
    } else {
      global.fetch = originalFetch;
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it(
    "should generate no error with KeysetEndpoint on DVR",
    async () => {
      const newDvr = DataVerificationRequest.fromJSON({
        zkvm: "sp1",
        dvr_title: "My DVR",
        dvr_id: "12345678",
        query_engine_ver: queryEngineVersionInfo.queryEngineVersion,
        query_method_ver: queryEngineVersionInfo.queryMethodVersion,
        query:
          '[{"assign":{"query_result":{"and":[{"==":[{"dvar":"country"},"Indonesia"]},{"==":[{"dvar":"city"},"Jakarta"]},{"or":[{"~==":[{"dvar":"skills[0]"},"Rust"]},{"~==":[{"dvar":"skills[1]"},"Rust"]},{"~==":[{"dvar":"skills[2]"},"Rust"]}]}]}}},{"output":{"title":"Job Qualification"}},{"output":{"name":{"dvar":"name"}}},{"output":{"is_qualified":{"lvar":"query_result"}}},{"output":{"result":{"lvar":"query_result"}}}]',
        user_data_url: "https://hostname/api/user_data/",
        user_data_verifying_key: {
          KeysetEndpoint: {
            jku: "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/issuer-key.json",
            kid: "k-1",
          },
        },
        dvr_verifying_key: {
          KeysetEndpoint: {
            jku: "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/verifier-key.json",
            kid: "k-1",
          },
        },
      });
      expect(newDvr).toBeDefined();
      expect(newDvr).toBeInstanceOf(DataVerificationRequest);
      const newDvrJwt = await newDvr.signToJwsToken(
        privateKeyVerifier,
        verifyingKeyJwksVerifier
      );
      expect(newDvrJwt).toBeDefined();
      expect(typeof newDvrJwt).toBe("string");

      const newUserDataJwt = await zkPassClient.signDataToJwsToken(
        privateKeyIssuer,
        newUserData,
        verifyingKeyJwksIssuer
      );
      expect(newUserDataJwt).toBeDefined();
      expect(typeof newUserDataJwt).toBe("string");

      const spyFetch = jest.spyOn(global, "fetch");

      const zkPassProof = await zkPassClient.generateZkPassProof(
        newUserDataJwt,
        newDvrJwt
      );
      expect(typeof zkPassProof).toBe("string");

      expect(spyFetch).toHaveBeenCalledWith(
        `${zkPassUrl}/v1/proof`,
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            authorization: "Basic " + expectedApiKeyEncoded,
          },
          method: "POST",
        })
      );

      let verifier: ZkPassProofMetadataValidator;
      if (!isUsingProductionWs) {
        verifier = new MockDvrValidator();
      } else {
        verifier = new RealDvrValidator(newDvr);
      }
      const result = await zkPassClient.verifyZkPassProof(
        zkPassProof,
        verifier
      );
      expect(result).toBeDefined();
      expect(result.output.result).toBe(true);
    },
    testTimeout
  );

  it(
    "should generate no error with PublicKey on DVR",
    async () => {
      const newDvr = DataVerificationRequest.fromJSON({
        zkvm: "sp1",
        dvr_title: "My DVR",
        dvr_id: "12345678",
        query_engine_ver: queryEngineVersionInfo.queryEngineVersion,
        query_method_ver: queryEngineVersionInfo.queryMethodVersion,
        query:
          '[{"assign":{"query_result":{"and":[{"==":[{"dvar":"country"},"Indonesia"]},{"==":[{"dvar":"city"},"Jakarta"]},{"or":[{"~==":[{"dvar":"skills[0]"},"Rust"]},{"~==":[{"dvar":"skills[1]"},"Rust"]},{"~==":[{"dvar":"skills[2]"},"Rust"]}]}]}}},{"output":{"title":"Job Qualification"}},{"output":{"name":{"dvar":"name"}}},{"output":{"is_qualified":{"lvar":"query_result"}}},{"output":{"result":{"lvar":"query_result"}}}]',
        user_data_url: "https://hostname/api/user_data/",
        user_data_verifying_key: {
          PublicKey: {
            x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX",
            y: "8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ==",
          },
        },
        dvr_verifying_key: {
          PublicKey: {
            x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU",
            y: "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==",
          },
        },
      });
      expect(newDvr).toBeDefined();
      expect(newDvr).toBeInstanceOf(DataVerificationRequest);
      const newDvrJwt = await newDvr.signToJwsToken(
        privateKeyVerifier,
        verifyingKeyJwksVerifier
      );
      expect(newDvrJwt).toBeDefined();
      expect(typeof newDvrJwt).toBe("string");

      const newUserDataJwt = await zkPassClient.signDataToJwsToken(
        privateKeyIssuer,
        newUserData,
        verifyingKeyJwksIssuer
      );
      expect(newUserDataJwt).toBeDefined();
      expect(typeof newUserDataJwt).toBe("string");

      const spyFetch = jest.spyOn(global, "fetch");

      const zkPassProof = await zkPassClient.generateZkPassProof(
        newUserDataJwt,
        newDvrJwt
      );
      expect(typeof zkPassProof).toBe("string");

      expect(spyFetch).toHaveBeenCalledWith(
        `${zkPassUrl}/v1/proof`,
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            authorization: "Basic " + expectedApiKeyEncoded,
          },
          method: "POST",
        })
      );

      let verifier: ZkPassProofMetadataValidator;
      if (!isUsingProductionWs) {
        verifier = new MockDvrValidator();
      } else {
        verifier = new RealDvrValidator(newDvr);
      }
      const result = await zkPassClient.verifyZkPassProof(
        zkPassProof,
        verifier
      );
      expect(result).toBeDefined();
      expect(result.output.result).toBe(true);
    },
    testTimeout
  );
});
