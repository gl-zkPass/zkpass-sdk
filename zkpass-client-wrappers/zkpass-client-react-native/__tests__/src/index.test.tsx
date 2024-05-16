/*
 * index.test.tsx
 * Unit test of zkpass-client-react-native (happy path)
 *
 * Authors:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: November 28th 2023
 * -----
 * Last Modified: April 22nd 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 *   JaniceLaksana (janice.laksana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { NativeModules } from 'react-native';
import { ZkPassClient, ZkPassApiKey } from '../../src/index';
import {
  privateKeyIssuer,
  privateKeyVerifier,
  publicKeyIssuer,
  publicKeyVerifier,
  verifyingKeyJwksIssuer,
  zkPassServiceKeys,
} from '../__mocks__/keys';
import {
  mockCustomData,
  mockCustomDataJwe,
  mockCustomDataJwt,
  mockCustomDataDecryptedString,
  mockCustomDataString,
  mockUserDataJwt,
  mockUserDataJweServer,
  mockUserDataJweLocal,
  mockFalseUserDataJwt,
  mockFalseUserDataJweServer,
  mockFalseUserDataJweLocal,
  mockBadUserDataJwt,
  mockBadUserDataJweServer,
  mockBadUserDataJweLocal,
} from '../__mocks__/userDataVariables';
import {
  mockDvrWithPublicKeyJwt,
  mockDvrWithPublicKeyJweServer,
  mockDvrWithPublicKeyJweLocal,
  mockDvrWithKeysetJwt,
  mockDvrWithKeysetJweServer,
  mockDvrWithKeysetJweLocal,
  mockInvalidDvrJwt,
  mockInvalidDvrJweServer,
  mockInvalidDvrJweLocal,
  proofResult,
  badUserDataError,
  badUserDataErrorResponse,
  invalidDvrError,
  invalidDvrErrorResponse,
} from '../__mocks__/dvrVariables';
import { mockFetchResponse } from '../__common__/mock';
require('dotenv-flow').config();

jest.mock('react-native', () => ({
  NativeModules: {
    ZkPassJwtUtility: {
      sign: jest.fn(),
      verify: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    },
  },
  Platform: {
    select: jest.fn(),
  },
}));

describe('zkpass-client-react-native lib', () => {
  let isUsingProductionWS: boolean;
  let zkPassClient: ZkPassClient;
  beforeAll(() => {
    isUsingProductionWS = process.env.IS_USING_PRODUCTION_WS
      ? process.env.IS_USING_PRODUCTION_WS === 'true'
      : false;

    const zkPassServiceUrl =
      process.env.ZKPASS_WS_URL ?? 'https://staging-zkpass.ssi.id';
    const zkPassApiKey = new ZkPassApiKey(
      process.env.ZKPASS_API_KEY ?? '',
      process.env.ZKPASS_API_SECRET ?? ''
    );
    zkPassClient = new ZkPassClient({ zkPassServiceUrl, zkPassApiKey });
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('zkPassClient.encryptDataToJweToken', () => {
    const mockEncrypt = NativeModules.ZkPassJwtUtility.encrypt as jest.MockedFn<
      typeof NativeModules.ZkPassJwtUtility.encrypt
    >;
    test('successfuly handle object typed data', async () => {
      mockEncrypt.mockResolvedValue(mockCustomDataJwe);
      const mockCustomDataPayload = JSON.stringify({ data: mockCustomData });

      const result = await zkPassClient.encryptDataToJweToken(
        publicKeyVerifier,
        mockCustomData
      );
      expect(mockEncrypt).toHaveBeenCalledWith(
        publicKeyVerifier,
        mockCustomDataPayload
      );
      expect(result).toBe(mockCustomDataJwe);
    });

    test('successfuly handle string typed data', async () => {
      mockEncrypt.mockResolvedValue(mockCustomDataJwe);

      const mockCustomDataPayload = JSON.stringify({
        data: JSON.parse(mockCustomDataString),
      });
      const result = await zkPassClient.encryptDataToJweToken(
        publicKeyVerifier,
        mockCustomDataString
      );
      expect(mockEncrypt).toHaveBeenCalledWith(
        publicKeyVerifier,
        mockCustomDataPayload
      );
      expect(result).toBe(mockCustomDataJwe);
    });

    test('should handle error on encryption', async () => {
      const mockError = new Error('error encryption');
      mockEncrypt.mockRejectedValue(mockError);

      try {
        await zkPassClient.encryptDataToJweToken(
          publicKeyVerifier,
          mockCustomDataString
        );
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });

  describe('zkPassClient.decryptJweToken', () => {
    const mockDecrypt = NativeModules.ZkPassJwtUtility.decrypt as jest.MockedFn<
      typeof NativeModules.ZkPassJwtUtility.decrypt
    >;
    test('successfuly handle correct decrypted', async () => {
      mockDecrypt.mockResolvedValue(mockCustomDataDecryptedString);

      const result = await zkPassClient.decryptJweToken(
        privateKeyVerifier,
        mockCustomDataJwe
      );
      expect(mockDecrypt).toHaveBeenCalledWith(
        privateKeyVerifier,
        mockCustomDataJwe
      );
      expect(result).toBe(JSON.stringify(mockCustomData));
    });

    test('successfuly handle incorrect decrypted', async () => {
      mockDecrypt.mockResolvedValue(mockCustomDataString);

      const result = await zkPassClient.decryptJweToken(
        privateKeyVerifier,
        mockCustomDataJwe
      );
      expect(mockDecrypt).toHaveBeenCalledWith(
        privateKeyVerifier,
        mockCustomDataJwe
      );
      expect(result).toBe(JSON.stringify(mockCustomData));
    });

    test('successfuly handle wrong data format', async () => {
      mockDecrypt.mockResolvedValue(mockCustomData);

      try {
        await zkPassClient.decryptJweToken(privateKeyVerifier, 'randomstring');
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });

    test('should handle error on decryption', async () => {
      const mockError = new Error('error decryption');
      mockDecrypt.mockRejectedValue(mockError);

      try {
        await zkPassClient.decryptJweToken(
          privateKeyVerifier,
          mockCustomDataJwe
        );
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });

  describe('zkPassClient.signDataToJwsToken', () => {
    const mockSign = NativeModules.ZkPassJwtUtility.sign as jest.MockedFn<
      typeof NativeModules.ZkPassJwtUtility.sign
    >;
    test('successfuly handle object typed data', async () => {
      mockSign.mockResolvedValue(mockCustomDataJwt);
      const mockCustomDataPayload = JSON.stringify({ data: mockCustomData });

      const result = await zkPassClient.signDataToJwsToken(
        privateKeyIssuer,
        mockCustomData
      );
      expect(mockSign).toHaveBeenCalledWith(
        privateKeyIssuer,
        mockCustomDataPayload,
        ''
      );
      expect(result).toBe(mockCustomDataJwt);
    });

    test('successfuly handle string typed data', async () => {
      mockSign.mockResolvedValue(mockCustomDataJwt);

      const mockCustomDataPayload = JSON.stringify({
        data: JSON.parse(mockCustomDataString),
      });
      const result = await zkPassClient.signDataToJwsToken(
        privateKeyIssuer,
        mockCustomDataString
      );
      expect(mockSign).toHaveBeenCalledWith(
        privateKeyIssuer,
        mockCustomDataPayload,
        ''
      );
      expect(result).toBe(mockCustomDataJwt);
    });

    test('successfuly handle object typed data with jwks', async () => {
      mockSign.mockResolvedValue(mockCustomDataJwt);
      const mockCustomDataPayload = JSON.stringify({ data: mockCustomData });
      const mockKeysetEndpoint = JSON.stringify(verifyingKeyJwksIssuer);

      const result = await zkPassClient.signDataToJwsToken(
        privateKeyIssuer,
        mockCustomData,
        verifyingKeyJwksIssuer
      );
      expect(mockSign).toHaveBeenCalledWith(
        privateKeyIssuer,
        mockCustomDataPayload,
        mockKeysetEndpoint
      );
      expect(result).toBe(mockCustomDataJwt);
    });

    test('should handle error on signing', async () => {
      const mockError = new Error('error signing');
      mockSign.mockRejectedValue(mockError);

      try {
        await zkPassClient.signDataToJwsToken(
          privateKeyIssuer,
          mockCustomDataString
        );
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });

  describe('zkPassClient.verifyJwsToken', () => {
    const mockVerify = NativeModules.ZkPassJwtUtility.verify as jest.MockedFn<
      typeof NativeModules.ZkPassJwtUtility.verify
    >;
    test('successfuly handle correct verification', async () => {
      mockVerify.mockResolvedValue(mockCustomDataDecryptedString);

      const result = await zkPassClient.verifyJwsToken(
        publicKeyIssuer,
        mockCustomDataJwt
      );
      expect(mockVerify).toHaveBeenCalledWith(
        publicKeyIssuer,
        mockCustomDataJwt
      );
      expect(result).toBe(JSON.stringify(mockCustomData));
    });

    test('successfuly handle incorrect verification', async () => {
      mockVerify.mockResolvedValue(mockCustomDataString);

      const result = await zkPassClient.verifyJwsToken(
        publicKeyIssuer,
        mockCustomDataJwt
      );
      expect(mockVerify).toHaveBeenCalledWith(
        publicKeyIssuer,
        mockCustomDataJwt
      );
      expect(result).toBe(JSON.stringify(mockCustomData));
    });

    test('successfuly handle wrong data format', async () => {
      mockVerify.mockResolvedValue(mockCustomData);

      try {
        await zkPassClient.verifyJwsToken(publicKeyIssuer, 'randomstring');
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });

    test('should handle error on verification', async () => {
      const mockError = new Error('error verification');
      mockVerify.mockRejectedValue(mockError);

      try {
        await zkPassClient.verifyJwsToken(publicKeyIssuer, mockCustomDataJwt);
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });

  describe('zkPassClient.generateZkPassProof', () => {
    const mockEncrypt = NativeModules.ZkPassJwtUtility.encrypt as jest.MockedFn<
      typeof NativeModules.ZkPassJwtUtility.encrypt
    >;
    const mockVerify = NativeModules.ZkPassJwtUtility.verify as jest.MockedFn<
      typeof NativeModules.ZkPassJwtUtility.verify
    >;
    const zkPassUrl =
      process.env.ZKPASS_WS_URL ?? 'https://staging-zkpass.ssi.id';
    const zkPassAPIKey = new ZkPassApiKey(
      process.env.ZKPASS_API_KEY ?? '',
      process.env.ZKPASS_API_SECRET ?? ''
    );
    test('successfuly handle token generation, proof is correct, DVR uses KeysetEndpoint', async () => {
      // to check mocked or end-to-end
      if (!isUsingProductionWS) {
        global.fetch = mockFetchResponse({
          [`${zkPassUrl}/v1/proof`]: {
            body: { proof: proofResult.proof },
            statusCode: proofResult.status,
          },
          [`${zkPassUrl}/.well-known/jwks.json`]: {
            body: zkPassServiceKeys,
            statusCode: 200,
          },
        });
      }
      mockVerify
        .mockResolvedValueOnce(
          JSON.stringify({
            x: zkPassServiceKeys[0]!.x,
            y: zkPassServiceKeys[0]!.y,
          })
        )
        .mockResolvedValueOnce(
          JSON.stringify({
            x: zkPassServiceKeys[1]!.x,
            y: zkPassServiceKeys[1]!.y,
          })
        );
      mockEncrypt
        .mockResolvedValueOnce(
          zkPassUrl === 'https://staging-zkpass.ssi.id'
            ? mockUserDataJweServer
            : mockUserDataJweLocal
        )
        .mockResolvedValueOnce(
          zkPassUrl === 'https://staging-zkpass.ssi.id'
            ? mockDvrWithKeysetJweServer
            : mockDvrWithKeysetJweLocal
        );

      const spyFetch = jest.spyOn(global, 'fetch');
      const result = await zkPassClient.generateZkPassProof(
        mockUserDataJwt,
        mockDvrWithKeysetJwt
      );
      expect(spyFetch).toHaveBeenNthCalledWith(
        2,
        `${zkPassUrl}/v1/proof`,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'authorization': 'Basic ' + zkPassAPIKey.getApiToken(),
          },
          method: 'POST',
        })
      );
      expect(typeof result).toBe('string');
    }, 60000);

    test('successfuly handle token generation, proof is correct, DVR uses PublicKey', async () => {
      // to check mocked or end-to-end
      if (!isUsingProductionWS) {
        global.fetch = mockFetchResponse({
          [`${zkPassUrl}/v1/proof`]: {
            body: { proof: proofResult.proof },
            statusCode: proofResult.status,
          },
          [`${zkPassUrl}/.well-known/jwks.json`]: {
            body: zkPassServiceKeys,
            statusCode: 200,
          },
        });
      }
      mockVerify
        .mockResolvedValueOnce(
          JSON.stringify({
            x: zkPassServiceKeys[0]!.x,
            y: zkPassServiceKeys[0]!.y,
          })
        )
        .mockResolvedValueOnce(
          JSON.stringify({
            x: zkPassServiceKeys[1]!.x,
            y: zkPassServiceKeys[1]!.y,
          })
        );
      mockEncrypt
        .mockResolvedValueOnce(
          zkPassUrl === 'https://staging-zkpass.ssi.id'
            ? mockUserDataJweServer
            : mockUserDataJweLocal
        )
        .mockResolvedValueOnce(
          zkPassUrl === 'https://staging-zkpass.ssi.id'
            ? mockDvrWithPublicKeyJweServer
            : mockDvrWithPublicKeyJweLocal
        );

      const spyFetch = jest.spyOn(global, 'fetch');
      const result = await zkPassClient.generateZkPassProof(
        mockUserDataJwt,
        mockDvrWithPublicKeyJwt
      );
      expect(spyFetch).toHaveBeenNthCalledWith(
        2,
        `${zkPassUrl}/v1/proof`,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'authorization': 'Basic ' + zkPassAPIKey.getApiToken(),
          },
          method: 'POST',
        })
      );
      expect(typeof result).toBe('string');
    }, 60000);

    test('successfuly handle token generation, proof is false', async () => {
      // to check mocked or end-to-end
      if (!isUsingProductionWS) {
        global.fetch = mockFetchResponse({
          [`${zkPassUrl}/v1/proof`]: {
            body: { proof: proofResult.proof },
            statusCode: proofResult.status,
          },
          [`${zkPassUrl}/.well-known/jwks.json`]: {
            body: zkPassServiceKeys,
            statusCode: 200,
          },
        });
      }
      mockVerify
        .mockResolvedValueOnce(
          JSON.stringify({
            x: zkPassServiceKeys[0]!.x,
            y: zkPassServiceKeys[0]!.y,
          })
        )
        .mockResolvedValueOnce(
          JSON.stringify({
            x: zkPassServiceKeys[1]!.x,
            y: zkPassServiceKeys[1]!.y,
          })
        );
      mockEncrypt
        .mockResolvedValueOnce(
          zkPassUrl === 'https://staging-zkpass.ssi.id'
            ? mockFalseUserDataJweServer
            : mockFalseUserDataJweLocal
        )
        .mockResolvedValueOnce(
          zkPassUrl === 'https://staging-zkpass.ssi.id'
            ? mockDvrWithKeysetJweServer
            : mockDvrWithKeysetJweLocal
        );

      const spyFetch = jest.spyOn(global, 'fetch');
      const result = await zkPassClient.generateZkPassProof(
        mockFalseUserDataJwt,
        mockDvrWithKeysetJwt
      );
      expect(spyFetch).toHaveBeenNthCalledWith(
        2,
        `${zkPassUrl}/v1/proof`,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'authorization': 'Basic ' + zkPassAPIKey.getApiToken(),
          },
          method: 'POST',
        })
      );
      expect(typeof result).toBe('string');
    }, 60000);

    test('successfuly handle error if User Data is missing one or more value that needed by the DVR', async () => {
      // to check mocked or end-to-end
      if (!isUsingProductionWS) {
        global.fetch = mockFetchResponse({
          [`${zkPassUrl}/v1/proof`]: {
            statusCode: badUserDataError.status,
            statusText: badUserDataError.statusText,
            body: {
              status: badUserDataError.status,
              status_code: badUserDataError.statusCode,
              status_text: badUserDataError.statusText,
            },
          },
          [`${zkPassUrl}/.well-known/jwks.json`]: {
            body: zkPassServiceKeys,
            statusCode: 200,
          },
        });
      }
      mockVerify
        .mockResolvedValueOnce(
          JSON.stringify({
            x: zkPassServiceKeys[0]!.x,
            y: zkPassServiceKeys[0]!.y,
          })
        )
        .mockResolvedValueOnce(
          JSON.stringify({
            x: zkPassServiceKeys[1]!.x,
            y: zkPassServiceKeys[1]!.y,
          })
        );
      mockEncrypt
        .mockResolvedValueOnce(
          zkPassUrl === 'https://staging-zkpass.ssi.id'
            ? mockBadUserDataJweServer
            : mockBadUserDataJweLocal
        )
        .mockResolvedValueOnce(
          zkPassUrl === 'https://staging-zkpass.ssi.id'
            ? mockDvrWithKeysetJweServer
            : mockDvrWithKeysetJweLocal
        );

      const spyFetch = jest.spyOn(global, 'fetch');
      await expect(
        zkPassClient.generateZkPassProof(
          mockBadUserDataJwt,
          mockDvrWithKeysetJwt
        )
      ).rejects.toThrow(Error(badUserDataErrorResponse));
      expect(spyFetch).toHaveBeenNthCalledWith(
        2,
        `${zkPassUrl}/v1/proof`,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'authorization': 'Basic ' + zkPassAPIKey.getApiToken(),
          },
          method: 'POST',
        })
      );
    }, 60000);

    test('successfuly handle error if DVR format is invalid', async () => {
      // to check mocked or end-to-end
      if (!isUsingProductionWS) {
        global.fetch = mockFetchResponse({
          [`${zkPassUrl}/v1/proof`]: {
            statusCode: invalidDvrError.status,
            statusText: invalidDvrError.statusText,
            body: {
              status: invalidDvrError.status,
              status_code: invalidDvrError.statusCode,
              status_text: invalidDvrError.statusText,
            },
          },
          [`${zkPassUrl}/.well-known/jwks.json`]: {
            body: zkPassServiceKeys,
            statusCode: 200,
          },
        });
      }
      mockVerify
        .mockResolvedValueOnce(
          JSON.stringify({
            x: zkPassServiceKeys[0]!.x,
            y: zkPassServiceKeys[0]!.y,
          })
        )
        .mockResolvedValueOnce(
          JSON.stringify({
            x: zkPassServiceKeys[1]!.x,
            y: zkPassServiceKeys[1]!.y,
          })
        );
      mockEncrypt
        .mockResolvedValueOnce(
          zkPassUrl === 'https://staging-zkpass.ssi.id'
            ? mockUserDataJweServer
            : mockUserDataJweLocal
        )
        .mockResolvedValueOnce(
          zkPassUrl === 'https://staging-zkpass.ssi.id'
            ? mockInvalidDvrJweServer
            : mockInvalidDvrJweLocal
        );

      const spyFetch = jest.spyOn(global, 'fetch');
      await expect(
        zkPassClient.generateZkPassProof(mockUserDataJwt, mockInvalidDvrJwt)
      ).rejects.toThrow(Error(invalidDvrErrorResponse));
      expect(spyFetch).toHaveBeenNthCalledWith(
        2,
        `${zkPassUrl}/v1/proof`,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'authorization': 'Basic ' + zkPassAPIKey.getApiToken(),
          },
          method: 'POST',
        })
      );
    }, 60000);

    test('successfuly handle incorrect User Data encryption', async () => {
      const mockError = new Error('error encryption');
      mockVerify
        .mockResolvedValueOnce(
          JSON.stringify({
            x: zkPassServiceKeys[0]!.x,
            y: zkPassServiceKeys[0]!.y,
          })
        )
        .mockResolvedValueOnce(
          JSON.stringify({
            x: zkPassServiceKeys[1]!.x,
            y: zkPassServiceKeys[1]!.y,
          })
        );
      mockEncrypt
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockDvrWithKeysetJweServer);
      try {
        await zkPassClient.generateZkPassProof(
          mockUserDataJwt,
          mockDvrWithKeysetJwt
        );
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });

    test('successfuly handle incorrect DVR encryption', async () => {
      const mockError = new Error('error encryption');
      mockVerify
        .mockResolvedValueOnce(
          JSON.stringify({
            x: zkPassServiceKeys[0]!.x,
            y: zkPassServiceKeys[0]!.y,
          })
        )
        .mockResolvedValueOnce(
          JSON.stringify({
            x: zkPassServiceKeys[1]!.x,
            y: zkPassServiceKeys[1]!.y,
          })
        );
      mockEncrypt
        .mockResolvedValueOnce(mockUserDataJweServer)
        .mockRejectedValueOnce(mockError);

      try {
        await zkPassClient.generateZkPassProof(
          mockUserDataJwt,
          mockDvrWithKeysetJwt
        );
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });

    test('successfuly handle bad fetch response', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('error fetch'))
      ) as jest.Mock;
      mockEncrypt
        .mockResolvedValueOnce(mockUserDataJweServer)
        .mockResolvedValueOnce(mockDvrWithKeysetJweServer);
      try {
        await zkPassClient.generateZkPassProof(
          mockUserDataJwt,
          mockDvrWithKeysetJwt
        );
        expect(global.fetch).toHaveBeenCalledWith(zkPassUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': 'Basic ' + zkPassAPIKey.getApiToken(),
          },
          body: JSON.stringify({
            user_data_token: mockUserDataJweServer,
            Dvr_token: mockDvrWithKeysetJweServer,
          }),
        });
      } catch (error) {
        expect(error).toEqual(new Error('error fetch'));
      }
    });
  });
});
