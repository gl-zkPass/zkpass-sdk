/*
 * keys/route.test.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { GET, POST } from "@/app/keys/route";
import { NextResponse } from "next/server";
import crypto from "crypto";

jest.mock("next/server", () => ({
  NextResponse: jest.fn(),
}));

jest.mock("crypto", () => ({
  generateKeyPairSync: jest.fn(),
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue("mockKid"),
    }),
  }),
}));

describe("keys/route.ts", () => {
  const nextRespJsonMock = jest.fn();

  beforeEach(() => {
    (NextResponse.json as jest.Mock) = nextRespJsonMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    test("generates a key pair and returns the correct response", async () => {
      const mockPublicKey =
        "-----BEGIN PUBLIC KEY-----\nmockX\nmockY\n-----END PUBLIC KEY-----";
      const mockPrivateKey =
        "-----BEGIN PRIVATE KEY-----\nmockPrivateKey\n-----END PRIVATE KEY-----";
      (crypto.generateKeyPairSync as jest.Mock).mockReturnValue({
        publicKey: mockPublicKey,
        privateKey: mockPrivateKey,
      });

      const response = await POST();

      expect(crypto.generateKeyPairSync).toHaveBeenCalledWith("ec", {
        namedCurve: "prime256v1",
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      });
      expect(crypto.createHash).toHaveBeenCalledWith("sha256");
      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: "ok",
        message: "Key pair generated, check your console log.",
      });
    });
  });

  describe("GET", () => {
    test("returns the correct response", async () => {
      const response = await GET();

      expect(nextRespJsonMock).toHaveBeenCalledWith({ data: "get api keys" });
    });
  });
});
