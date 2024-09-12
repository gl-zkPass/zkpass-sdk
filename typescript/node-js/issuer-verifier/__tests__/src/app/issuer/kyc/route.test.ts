/*
 * issuer/kyc/route.test.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { POST, GET, OPTIONS } from "@/app/issuer/kyc/route";
import fs from "fs";
import path from "path";
import { signDataToJwsToken } from "@/utils/signing";
import { NextResponse } from "next/server";
import {
  KYC_ISSUER_JWKS_URL,
  KYC_ISSUER_JWKS_KID,
  KYC_ISSUER_PRIVATE_KEY_PEM,
} from "@/utils/constants";

jest.mock("fs");
jest.mock("path");
jest.mock("@/utils/signing");
jest.mock("@didpass/zkpass-client-ts", () => ({
  ZkPassApiKey: jest.fn(),
  ZkPassClient: jest.fn().mockImplementation(() => ({
    signDataToJwsToken: jest.fn(),
  })),
}));

jest.mock("next/server", () => ({
  NextResponse: jest.fn(),
}));

describe("issuer/kyc/route.ts", () => {
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

  function checkHeader() {
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
  }

  describe("POST", () => {
    test("returns 200 and JWT for valid user", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ name: "validUser" }),
      } as unknown as Request;

      const mockKycResult = {
        kycId: "kyc123",
        kycType: "type123",
        subject: {
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: "1990-01-01",
        },
      };

      const mockKycResults = {
        validUser: mockKycResult,
      };

      (path.join as jest.Mock).mockReturnValue("/mock/path/to/kyc-result.json");
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockKycResults)
      );
      (signDataToJwsToken as jest.Mock).mockResolvedValue("mockJwt");

      const response = await POST(mockRequest);

      expect(signDataToJwsToken).toHaveBeenCalledWith(mockKycResult, {
        jwks: {
          jku: KYC_ISSUER_JWKS_URL,
          kid: KYC_ISSUER_JWKS_KID,
        },
        privateKey: KYC_ISSUER_PRIVATE_KEY_PEM,
      });

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 200,
        data: "mockJwt",
      });
      checkHeader();
    });

    test("returns 400 for invalid user", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ name: "invalidUser" }),
      } as unknown as Request;

      const mockKycResults = {
        validUser: {
          kycId: "kyc123",
          kycType: "type123",
          subject: {
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "1990-01-01",
          },
        },
      };

      (path.join as jest.Mock).mockReturnValue("/mock/path/to/kyc-result.json");
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockKycResults)
      );

      const response = await POST(mockRequest);

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 400,
        message: "Kyc Result for invalidUser is not found",
      });
    });
  });

  describe("GET", () => {
    test("returns the correct response", async () => {
      const response = await GET();

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        data: "get api kyc",
      });
    });
  });

  describe("OPTIONS", () => {
    test("returns 200 and sets correct headers", async () => {
      const response = await OPTIONS();

      expect(nextRespJsonMock).toHaveBeenCalledWith({ status: 200 });
      checkHeader();
    });
  });
});
