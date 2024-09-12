/*
 * verifier/proofs/route.test.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { POST, GET } from "@/app/verifier/proofs/route";
import { ZkPassApiKey, ZkPassClient } from "@didpass/zkpass-client-ts";
import {
  API_KEY,
  API_SECRET,
  ZKPASS_SERVICE_URL,
  ZKPASS_ZKVM,
} from "@/utils/constants";
import { MyValidator } from "@/app/verifier/proofs/proofValidator";
import { NextRequest, NextResponse } from "next/server";

jest.mock("@didpass/zkpass-client-ts", () => ({
  ZkPassApiKey: jest.fn(),
  ZkPassClient: jest.fn().mockImplementation(() => ({
    verifyZkPassProof: jest.fn(),
  })),
}));

jest.mock("@/app/verifier/proofs/proofValidator", () => ({
  MyValidator: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: jest.fn(),
}));

describe("verifier/proofs/route.ts", () => {
  const nextRespJsonMock = jest.fn();

  beforeEach(() => {
    (NextResponse.json as jest.Mock) = nextRespJsonMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    let req: NextRequest;

    beforeEach(() => {
      req = {
        json: jest.fn().mockResolvedValue({ proof: "mockProof" }),
      } as unknown as NextRequest;
    });

    test("should return 200 and proof result on successful validation", async () => {
      const mockProofResult = { valid: true };
      const verifyZkPassProofMock = jest
        .fn()
        .mockResolvedValue(mockProofResult);
      (ZkPassClient as jest.Mock).mockImplementation(() => ({
        verifyZkPassProof: verifyZkPassProofMock,
      }));

      const response = await POST(req);

      expect(ZkPassApiKey).toHaveBeenCalledWith(API_KEY, API_SECRET);
      expect(ZkPassClient).toHaveBeenCalledWith({
        zkPassServiceUrl: ZKPASS_SERVICE_URL,
        zkPassApiKey: expect.any(ZkPassApiKey),
        zkVm: ZKPASS_ZKVM,
      });
      expect(verifyZkPassProofMock).toHaveBeenCalledWith(
        "mockProof",
        expect.any(MyValidator)
      );

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 200,
        data: mockProofResult,
      });
    });

    test("should return 400 and error message on validation failure", async () => {
      (ZkPassClient as jest.Mock).mockImplementation(() => ({
        verifyZkPassProof: jest
          .fn()
          .mockRejectedValue(new Error("Validation error")),
      }));

      const response = await POST(req);

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 400,
        message: "Error validating proof",
      });
    });
  });

  describe("GET", () => {
    test("should return 200 and expected data", async () => {
      const response = await GET();

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        data: "get api proofs",
      });
    });
  });
});
