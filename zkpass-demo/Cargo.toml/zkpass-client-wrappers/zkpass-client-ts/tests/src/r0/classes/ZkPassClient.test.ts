/*
 * ZkPassClient.test.ts
 * Unit tests for zkPass Client Class.
 *
 * Authors:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 * Created at: November 29th 2023
 * -----
 * Last Modified: April 16th 2024
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

import { ZkPassApiKey, ZkPassClient } from "../../../../src";
import {
  mockData,
  mockDataJwe,
  mockDataJwsToken,
  userDataJwt,
  dvrJwt,
  unmatchingDvrJwt,
  badDvrJwt,
  badUserDataJwt,
  dvrJwtWithPublicKey,
} from "../../../resources/r0/variables/zkPassClient";
import {
  publicKeyIssuer,
  privateKeyIssuer,
  privateKeyVerifier,
  publicKeyVerifier,
  verifyingKeyJwksIssuer,
} from "../../../resources/r0/variables/keys";
import MockDvrValidator from "../../../resources/r0/mockDvrValidator";
import { errors } from "jose";
import { queryEngineResult } from "../../../resources/r0/variables/mockResult";
import { proofToken } from "../../../resources/r0/variables/zkProofTrue";
import { falseProofToken } from "../../../resources/r0/variables/zkProofFalse";
import { ZKPASS_SERVICE_KEYS } from "../../../resources/zkPassServiceKeys";
import { mockFetchResponse } from "../../common/mock";
import { proofTokenStaging } from "../../../resources/r0/variables/zkProofTrueStaging";
require("dotenv-flow").config();

const testTimeout = process.env.TEST_TIMEOUT_MS
  ? Number(process.env.TEST_TIMEOUT_MS)
  : 60000;

describe("ZkPassClient", () => {
  let zkPassClient: ZkPassClient;
  let isUsingProductionWs: boolean;
  let zkPassUrl: string;
  let zkPassApiKey: string;
  let zkPassApiSecret: string;
  let expectedApiKeyEncoded: string;
  let originalFetch: any;
  let originalProcessEnv: any;
  beforeAll(() => {
    isUsingProductionWs = process.env.IS_USING_PRODUCTION_WS
      ? process.env.IS_USING_PRODUCTION_WS === "true"
      : false;

    zkPassUrl = process.env.ZKPASS_WS_URL
      ? process.env.ZKPASS_WS_URL
      : "https://staging-zkpass.ssi.id";

    zkPassApiKey = process.env.ZKPASS_API_KEY ? process.env.ZKPASS_API_KEY : "";
    zkPassApiSecret = process.env.ZKPASS_API_SECRET
      ? process.env.ZKPASS_API_SECRET
      : "";
    expectedApiKeyEncoded = Buffer.from(
      `${zkPassApiKey}:${zkPassApiSecret}`
    ).toString("base64");
    originalFetch = global.fetch;
    originalProcessEnv = { ...process.env };
  });

  beforeEach(() => {
    const apiKey = new ZkPassApiKey(zkPassApiKey, zkPassApiSecret);
    zkPassClient = new ZkPassClient({
      zkPassServiceUrl: zkPassUrl,
      zkPassApiKey: apiKey,
      zkVm: "r0",
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getQueryEngineVersionInfo", () => {
    afterEach(() => {
      process.env = { ...originalProcessEnv };
    });
    it("should return the query engine version info", async () => {
      const result = await zkPassClient.getQueryEngineVersionInfo();

      const {
        query_engine_version: queryEngineVersion,
        query_method_version: queryMethodVersion,
      } = JSON.parse(queryEngineResult).Result;

      expect(result).toEqual({
        queryEngineVersion: queryEngineVersion,
        queryMethodVersion: queryMethodVersion,
      });
    });

    it("should return error if the .so file path is not found", async () => {
      process.env.FFI_BINARY_PATH = "/home/invalid/path";
      expect(
        () =>
          new ZkPassClient({
            zkPassServiceUrl: zkPassUrl,
            zkVm: "r0",
          })
      ).toThrow(/no such file or directory/);
    });
  });

  describe("encryptDataToJweToken", () => {
    it("should encrypt data to JWE token", async () => {
      const jweToken = await zkPassClient.encryptDataToJweToken(
        publicKeyIssuer,
        mockData
      );
      expect(jweToken).toBeDefined();
      expect(typeof jweToken).toBe("string");
    });

    it("should throw error if key is not public key", async () => {
      await expect(
        zkPassClient.encryptDataToJweToken(privateKeyIssuer, mockData)
      ).rejects.toThrow(TypeError('"spki" must be SPKI formatted string'));
    });
  });

  describe("decryptJweToken", () => {
    it("should decrypt JWE token to data", async () => {
      const decryptResult = await zkPassClient.decryptJweToken(
        privateKeyIssuer,
        mockDataJwe
      );
      expect(decryptResult.payload.data).toEqual(mockData);
    });

    it("should throw error if key is not private key", async () => {
      await expect(
        zkPassClient.decryptJweToken(publicKeyIssuer, mockDataJwe)
      ).rejects.toThrow(TypeError('"pkcs8" must be PKCS#8 formatted string'));
    });

    it("should throw error if key is not matching key", async () => {
      await expect(
        zkPassClient.decryptJweToken(privateKeyVerifier, mockDataJwe)
      ).rejects.toThrow(errors.JWEDecryptionFailed);
    });
  });

  describe("signDataToJwsToken", () => {
    it("should sign data to JWS token with verifying key jwks", async () => {
      const jwsToken = await zkPassClient.signDataToJwsToken(
        privateKeyIssuer,
        mockData,
        verifyingKeyJwksIssuer
      );
      expect(jwsToken).toBeDefined();
      expect(typeof jwsToken).toBe("string");
    });

    it("should sign data to JWS token without verifying key jwks", async () => {
      const jwsToken = await zkPassClient.signDataToJwsToken(
        privateKeyIssuer,
        mockData
      );
      expect(jwsToken).toBeDefined();
      expect(typeof jwsToken).toBe("string");
    });

    it("should throw error if key is not private key", async () => {
      await expect(
        zkPassClient.signDataToJwsToken(publicKeyIssuer, mockData)
      ).rejects.toThrow(TypeError('"pkcs8" must be PKCS#8 formatted string'));
    });
  });

  describe("verifyJwsToken", () => {
    it("should verify JWS token", async () => {
      const verifyResult = await zkPassClient.verifyJwsToken(
        publicKeyIssuer,
        mockDataJwsToken
      );
      expect(verifyResult.payload.data).toEqual(mockData);
    });

    it("should throw error if key is not public key", async () => {
      await expect(
        zkPassClient.verifyJwsToken(privateKeyIssuer, mockDataJwsToken)
      ).rejects.toThrow(TypeError('"spki" must be SPKI formatted string'));
    });

    it("should throw error if key is not matching key", async () => {
      await expect(
        zkPassClient.verifyJwsToken(publicKeyVerifier, mockDataJwsToken)
      ).rejects.toThrow(errors.JWSSignatureVerificationFailed);
    });
  });

  describe("generateZkPassProof", () => {
    afterEach(() => {
      global.fetch = originalFetch;
    });
    it(
      "should generate zkpass proof using matching user data and dvr token with KeysetEndpointWrapped as DVR's userDataVerifyingKey",
      async () => {
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
        }

        const spyFetch = jest.spyOn(global, "fetch");

        const zkPassProof = await zkPassClient.generateZkPassProof(
          userDataJwt,
          dvrJwt
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
      },
      testTimeout
    );

    it(
      "should generate zkpass proof using matching user data and dvr token with PublicKeyWrapped as DVR's userDataVerifyingKey",
      async () => {
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
        }

        const spyFetch = jest.spyOn(global, "fetch");

        const zkPassProof = await zkPassClient.generateZkPassProof(
          userDataJwt,
          dvrJwtWithPublicKey
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
      },
      testTimeout
    );

    it(
      "should generate zkpass proof using unmatching user data and dvr token",
      async () => {
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
        }
        const spyFetch = jest.spyOn(global, "fetch");

        const zkPassProof = await zkPassClient.generateZkPassProof(
          userDataJwt,
          unmatchingDvrJwt
        );
        expect(zkPassProof).toBeDefined();

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
      },
      testTimeout
    );

    it(
      "should throw error if response from the url is not (200)OK",
      async () => {
        global.fetch = mockFetchResponse({
          [`${zkPassUrl}/v1/proof`]: {
            statusCode: 502,
            statusText: "Bad Gateway",
          },
          [`${zkPassUrl}/.well-known/jwks.json`]: {
            body: ZKPASS_SERVICE_KEYS,
            statusCode: 200,
          },
        });
        await expect(
          zkPassClient.generateZkPassProof(userDataJwt, dvrJwt)
        ).rejects.toThrow();
      },
      testTimeout
    );

    it(
      "should throw error if dvr (tokenized) is missing one or more value",
      async () => {
        if (!isUsingProductionWs) {
          global.fetch = mockFetchResponse({
            [`${zkPassUrl}/v1/proof`]: {
              statusCode: 400,
              statusText: "Bad Request",
              body: {
                status: 400,
                status_code: "E2008-ECustomError",
                status_text:
                  "Custom Error: ZkPassError: MissingRootDataElementError",
              },
            },
            [`${zkPassUrl}/.well-known/jwks.json`]: {
              body: ZKPASS_SERVICE_KEYS,
              statusCode: 200,
            },
          });
        }
        await expect(
          zkPassClient.generateZkPassProof(userDataJwt, badDvrJwt)
        ).rejects.toThrow(
          Error(
            "400 E2008-ECustomError: Custom Error: ZkPassError: MissingRootDataElementError"
          )
        );
      },
      testTimeout
    );

    it(
      "should throw error if user data (tokenized) is missing one or more value that needed by the dvr",
      async () => {
        if (!isUsingProductionWs) {
          global.fetch = mockFetchResponse({
            [`${zkPassUrl}/v1/proof`]: {
              statusCode: 400,
              statusText: "Bad Request",
              body: {
                status: 400,
                status_code: "E2008-ECustomError",
                status_text:
                  'Custom Error: ZkPassError: QueryEngineError("DataVariableResolutionError")',
              },
            },
            [`${zkPassUrl}/.well-known/jwks.json`]: {
              body: ZKPASS_SERVICE_KEYS,
              statusCode: 200,
            },
          });
        }
        await expect(
          zkPassClient.generateZkPassProof(badUserDataJwt, dvrJwt)
        ).rejects.toThrow(
          Error(
            '400 E2008-ECustomError: Custom Error: ZkPassError: QueryEngineError("DataVariableResolutionError")'
          )
        );
      },
      testTimeout
    );

    it(
      "should throw error if api key is not valid",
      async () => {
        if (!isUsingProductionWs) {
          global.fetch = mockFetchResponse({
            [`${zkPassUrl}/v1/proof`]: {
              statusCode: 401,
              statusText: "Unauthorized",
              body: {
                status: 401,
                status_code: "UNAUTHORIZED",
                status_text: "Unauthorized, please input the correct token",
              },
            },
            [`${zkPassUrl}/.well-known/jwks.json`]: {
              body: ZKPASS_SERVICE_KEYS,
              statusCode: 200,
            },
          });
        }
        const invalidZkPassClient = new ZkPassClient({
          zkPassServiceUrl: zkPassUrl,
          zkPassApiKey: new ZkPassApiKey(
            '"invalid_api_key_testing"',
            '"invalid_api_secret_testing"'
          ),
          zkVm: "r0",
        });
        await expect(
          invalidZkPassClient.generateZkPassProof(userDataJwt, dvrJwt)
        ).rejects.toThrow(
          Error(
            "401 UNAUTHORIZED: Unauthorized, please input the correct token"
          )
        );
      },
      testTimeout
    );
  });

  describe("verifyZkPassProof", () => {
    beforeEach(() => {
      if (!isUsingProductionWs) {
        global.fetch = mockFetchResponse({
          [`${zkPassUrl}/.well-known/jwks.json`]: {
            body: ZKPASS_SERVICE_KEYS,
            statusCode: 200,
          },
        });
      }
    });

    afterEach(() => {
      process.env = { ...originalProcessEnv };
      global.fetch = originalFetch;
    });

    it("should return true if proof is valid", async () => {
      let proofTokenVerify = proofToken;
      if (zkPassUrl === "https://staging-zkpass.ssi.id") {
        proofTokenVerify = proofTokenStaging;
      }
      const verifyProof = await zkPassClient.verifyZkPassProof(
        proofTokenVerify,
        new MockDvrValidator()
      );
      expect(verifyProof).toBeDefined();
      expect(verifyProof.output.result).toBe(true);
    });

    it("should return false if proof is invalid", async () => {
      try {
        const verifyProof = await zkPassClient.verifyZkPassProof(
          falseProofToken,
          new MockDvrValidator()
        );
        expect(verifyProof.output.result).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it("should return error if the .so file path is not found", async () => {
      process.env.FFI_BINARY_PATH = "/home/invalid/path";
      expect(
        () =>
          new ZkPassClient({
            zkPassServiceUrl: zkPassUrl,
            zkVm: "r0",
          })
      ).toThrow(/no such file or directory/);
    });
  });
});
