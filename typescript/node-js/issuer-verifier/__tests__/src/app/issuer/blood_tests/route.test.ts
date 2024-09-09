/*
 * issuer/blood_tests/route.test.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import fs from "fs";
import path from "path";
import { signDataToJwsToken } from "@/utils/signing";
import { NextResponse } from "next/server";
import {
  BLOOD_TEST_ISSUER_JWKS_KID,
  BLOOD_TEST_ISSUER_JWKS_URL,
  BLOOD_TEST_ISSUER_PRIVATE_KEY_PEM,
} from "@/utils/constants";
import { GET, OPTIONS, POST } from "@/app/issuer/blood_tests/route";

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

      const mockBloodTest = {
        testId: "test123",
        lab: { ID: "lab123" },
        subject: {
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: "1990-01-01",
        },
        measuredPanelsNgML: { cocaine: "0" },
      };

      const mockBloodTests = {
        validUser: mockBloodTest,
      };

      (path.join as jest.Mock).mockReturnValue(
        "/mock/path/to/blood-tests.json"
      );
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockBloodTests)
      );
      (signDataToJwsToken as jest.Mock).mockResolvedValue("mockJwt");

      const response = await POST(mockRequest);

      expect(signDataToJwsToken).toHaveBeenCalledWith(mockBloodTest, {
        jwks: {
          jku: BLOOD_TEST_ISSUER_JWKS_URL,
          kid: BLOOD_TEST_ISSUER_JWKS_KID,
        },
        privateKey: BLOOD_TEST_ISSUER_PRIVATE_KEY_PEM,
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

      const mockBloodTests = {
        validUser: {
          testId: "test123",
          lab: { ID: "lab123" },
          subject: {
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "1990-01-01",
          },
          measuredPanelsNgML: { cocaine: "0" },
        },
      };

      (path.join as jest.Mock).mockReturnValue(
        "/mock/path/to/blood-tests.json"
      );
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockBloodTests)
      );

      const response = await POST(mockRequest);

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 400,
        message: "Blood test for invalidUser is not found",
      });
    });
  });

  describe("GET", () => {
    test("returns the correct response", async () => {
      const response = await GET();

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        data: "get api blood_tests",
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
