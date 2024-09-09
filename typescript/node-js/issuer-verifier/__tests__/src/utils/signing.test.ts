/*
 * signing.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { ZkPassApiKey, ZkPassClient } from "@didpass/zkpass-client-ts";
import {
  API_KEY,
  API_SECRET,
  ZKPASS_SERVICE_URL,
  ZKPASS_ZKVM,
} from "@/utils/constants";
import { signDataToJwsToken } from "@/utils/signing";

jest.mock("@didpass/zkpass-client-ts", () => ({
  ZkPassApiKey: jest.fn(),
  ZkPassClient: jest.fn().mockImplementation(() => ({
    signDataToJwsToken: jest.fn(),
  })),
}));

describe("signing.ts", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signDataToJwsToken", () => {
    test("returns a signed JWS token for valid input", async () => {
      const mockData = { key: "value" };
      const mockSigningKey = {
        privateKey: "mockPrivateKey",
        jwks: {
          jku: "mockJku",
          kid: "mockKid",
        },
      };

      const mockToken = "mockSignedToken";
      const mockSignDataToJwsToken = jest.fn().mockResolvedValue(mockToken);
      (ZkPassClient as jest.Mock).mockImplementation(() => ({
        signDataToJwsToken: mockSignDataToJwsToken,
      }));

      const result = await signDataToJwsToken(mockData, mockSigningKey);

      expect(result).toBe(mockToken);
      expect(ZkPassApiKey).toHaveBeenCalledWith(API_KEY, API_SECRET);
      expect(ZkPassClient).toHaveBeenCalledWith({
        zkPassServiceUrl: ZKPASS_SERVICE_URL,
        zkPassApiKey: expect.any(ZkPassApiKey),
        zkVm: ZKPASS_ZKVM,
      });
      expect(mockSignDataToJwsToken).toHaveBeenCalledWith(
        mockSigningKey.privateKey,
        mockData,
        {
          jku: mockSigningKey.jwks.jku,
          kid: mockSigningKey.jwks.kid,
        }
      );
    });

    test("throws an error when signing fails", async () => {
      const mockData = { key: "value" };
      const mockSigningKey = {
        privateKey: "mockPrivateKey",
        jwks: {
          jku: "mockJku",
          kid: "mockKid",
        },
      };

      const mockError = new Error("Signing failed");
      const mockSignDataToJwsToken = jest.fn().mockRejectedValue(mockError);
      (ZkPassClient as jest.Mock).mockImplementation(() => ({
        signDataToJwsToken: mockSignDataToJwsToken,
      }));

      await expect(
        signDataToJwsToken(mockData, mockSigningKey)
      ).rejects.toThrow("Signing failed");

      expect(ZkPassApiKey).toHaveBeenCalledWith(API_KEY, API_SECRET);
      expect(ZkPassClient).toHaveBeenCalledWith({
        zkPassServiceUrl: ZKPASS_SERVICE_URL,
        zkPassApiKey: expect.any(ZkPassApiKey),
        zkVm: ZKPASS_ZKVM,
      });
      expect(mockSignDataToJwsToken).toHaveBeenCalledWith(
        mockSigningKey.privateKey,
        mockData,
        {
          jku: mockSigningKey.jwks.jku,
          kid: mockSigningKey.jwks.kid,
        }
      );
    });
  });
});
