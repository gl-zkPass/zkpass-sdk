/*
 * api/proofs/route.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */

import { POST, OPTIONS } from "@/app/api/proofs/route";
import { NextResponse } from "next/server";
import { ZkPassClient } from "@didpass/zkpass-client-ts";

jest.mock("@didpass/zkpass-client-ts", () => ({
  ZkPassApiKey: jest.fn(),
  ZkPassClient: jest.fn().mockImplementation(() => ({
    generateZkPassProof: jest.fn(),
  })),
}));

jest.mock("next/server", () => ({
  NextResponse: jest.fn(),
}));

describe("route.ts", () => {
  const nextRespSetMock = jest.fn();
  const nextRespJsonMock = jest.fn().mockReturnValue({
    headers: {
      set: nextRespSetMock,
    },
  });

  beforeEach(() => {
    (NextResponse.json as jest.Mock) = nextRespJsonMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    test("returns 200 and proof data for valid input (Multiple User Data)", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          dvr: "valid_dvr",
          blood_test: "valid_blood_test",
          kyc: "valid_kyc",
        }),
      } as unknown as Request;

      const mockProof = { proof: "valid_proof" };
      const mockGenerateZkPassProof = jest.fn().mockResolvedValue(mockProof);
      (ZkPassClient as jest.Mock).mockImplementation(() => ({
        generateZkPassProof: mockGenerateZkPassProof,
      }));

      const response = await POST(mockRequest);

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 200,
        data: mockProof,
      });
      expect(mockGenerateZkPassProof).toHaveBeenCalledWith(
        { blood_test: "valid_blood_test", kyc: "valid_kyc" },
        "valid_dvr"
      );
    });

    test("returns 200 and proof data for valid input (Single User Data)", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          dvr: "valid_dvr",
          blood_test: "valid_blood_test",
          kyc: null,
        }),
      } as unknown as Request;

      const mockProof = { proof: "valid_proof" };
      const mockGenerateZkPassProof = jest.fn().mockResolvedValue(mockProof);
      (ZkPassClient as jest.Mock).mockImplementation(() => ({
        generateZkPassProof: mockGenerateZkPassProof,
      }));

      const response = await POST(mockRequest);

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 200,
        data: mockProof,
      });
      expect(mockGenerateZkPassProof).toHaveBeenCalledWith(
        { "": "valid_blood_test" },
        "valid_dvr"
      );
    });

    test("returns 200 and error message for invalid input", async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error("Invalid input")),
      } as unknown as Request;

      const response = await POST(mockRequest);

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 200,
        message: "Error generating proof",
      });
    });
  });

  describe("OPTIONS", () => {
    test("returns 200 and sets correct headers", async () => {
      const response = await OPTIONS();
      expect(nextRespJsonMock).toHaveBeenCalledWith({ status: 200 });

      expect(nextRespSetMock).toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "*"
      );
      expect(nextRespSetMock).toHaveBeenCalledWith(
        "Access-Control-Allow-Methods",
        "POST, GET, OPTIONS"
      );
      expect(nextRespSetMock).toHaveBeenCalledWith(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
    });
  });
});
