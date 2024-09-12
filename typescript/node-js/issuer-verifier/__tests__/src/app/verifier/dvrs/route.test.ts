/*
 * verifier/dvrs/route.test.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";
import {
  ZkPassClient,
  DataVerificationRequest,
} from "@didpass/zkpass-client-ts";
import { GET, OPTIONS, POST } from "@/app/verifier/dvrs/route";
import {
  VERIFIER_JWKS_KID,
  VERIFIER_JWKS_URL,
  ZKPASS_ZKVM,
} from "@/utils/constants";

jest.mock("fs");
jest.mock("path");
jest.mock("uuid");
jest.mock("@didpass/zkpass-client-ts", () => ({
  ZkPassApiKey: jest.fn(),
  ZkPassClient: jest.fn().mockImplementation(() => ({
    signDataToJwsToken: jest.fn(),
  })),
  DataVerificationRequest: {
    fromJSON: jest.fn(),
  },
}));

jest.mock("@/app/verifier/dvrs/dvrHelper", () => ({
  dvrLookup: {
    value: {
      addDvr: jest.fn(),
    },
  },
}));

jest.mock("next/server", () => ({
  NextResponse: jest.fn(),
}));

describe("verifier/dvrs/route.ts", () => {
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
    const mockDvrToken = "mockDvrToken";
    const mockUuid = "mockUuid";
    const singleUserDataQuery =
      '[{"assign":{"lab_id":{"==":[{"dvar":"lab.ID"},"QH801874"]}}},{"assign":{"test_id":{"==":[{"dvar":"testID"},"SCREEN-7083-12345"]}}},{"assign":{"subject_first_name":{"~==":[{"dvar":"subject.firstName"},"John"]}}},{"assign":{"subject_last_name":{"~==":[{"dvar":"subject.lastName"},"Doe"]}}},{"assign":{"subject_date_of_birth":{"==":[{"dvar":"subject.dateOfBirth"},"1990-01-01"]}}},{"assign":{"measuredPanelsNgML_cocaine":{"<=":[{"dvar":"measuredPanelsNgML.cocaine"},10]}}},{"assign":{"test_passed":{"and":[{"lvar":"lab_id"},{"lvar":"test_id"},{"lvar":"subject_first_name"},{"lvar":"subject_last_name"},{"lvar":"subject_date_of_birth"},{"lvar":"measuredPanelsNgML_cocaine"}]}}},{"output":{"result":{"lvar":"test_passed"}}}]';
    const multipleUserDataQuery =
      '[{"assign":{"lab_id":{"==":[{"dvar":"blood_test.lab.ID"},"QH801874"]}}},{"assign":{"test_id":{"==":[{"dvar":"blood_test.testID"},"SCREEN-7083-12345"]}}},{"assign":{"subject_first_name":{"~==":[{"dvar":"blood_test.subject.firstName"},"John"]}}},{"assign":{"subject_last_name":{"~==":[{"dvar":"blood_test.subject.lastName"},"Doe"]}}},{"assign":{"subject_date_of_birth":{"==":[{"dvar":"blood_test.subject.dateOfBirth"},"1990-01-01"]}}},{"assign":{"measuredPanelsNgML_cocaine":{"<=":[{"dvar":"blood_test.measuredPanelsNgML.cocaine"},10]}}},{"assign":{"matchKycId":{"==":[{"dvar":"blood_test.subject.kyc.kycId"},{"dvar":"kyc.kycId"}]}}},{"assign":{"matchKycType":{"==":[{"dvar":"blood_test.subject.kyc.kycType"},{"dvar":"kyc.kycType"}]}}},{"assign":{"matchDateOfBirth":{"==":[{"dvar":"blood_test.subject.dateOfBirth"},{"dvar":"kyc.subject.dateOfBirth"}]}}},{"assign":{"test_passed":{"and":[{"lvar":"lab_id"},{"lvar":"test_id"},{"lvar":"subject_first_name"},{"lvar":"subject_last_name"},{"lvar":"subject_date_of_birth"},{"lvar":"measuredPanelsNgML_cocaine"},{"lvar":"matchKycId"},{"lvar":"matchKycType"},{"lvar":"matchDateOfBirth"}]}}},{"output":{"result":{"lvar":"test_passed"}}}]';

    function dvrObject(mode: "MultipleUSerData" | "SingleUserData") {
      const query =
        mode == "MultipleUSerData"
          ? multipleUserDataQuery
          : singleUserDataQuery;

      const userDataRequestTemplate = {
        user_data_url: "http://localhost:3000/verifier",
        user_data_verifying_key: {
          KeysetEndpoint: {
            jku: "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/issuer-key.json",
            kid: "k-1",
          },
        },
      };
      const userDataRequests =
        mode == "MultipleUSerData"
          ? {
              blood_test: userDataRequestTemplate,
              kyc: userDataRequestTemplate,
            }
          : {
              "": userDataRequestTemplate,
            };

      return {
        dvr_title: "Onboarding Blood Test",
        dvr_id: mockUuid,
        query_engine_ver: "1.0",
        query_method_ver: "1.0",
        query: query,
        user_data_requests: userDataRequests,
        dvr_verifying_key: {
          KeysetEndpoint: {
            jku: VERIFIER_JWKS_URL,
            kid: VERIFIER_JWKS_KID,
          },
        },
        zkvm: ZKPASS_ZKVM,
      };
    }

    beforeEach(() => {
      (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify({
          validUser: {
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "1990-01-01",
          },
        })
      );

      DataVerificationRequest.fromJSON = jest.fn().mockReturnValue({
        signToJwsToken: jest.fn().mockResolvedValue(mockDvrToken),
      });

      (ZkPassClient as jest.Mock).mockImplementation(() => ({
        getQueryEngineVersionInfo: jest.fn().mockResolvedValue({
          queryEngineVersion: "1.0",
          queryMethodVersion: "1.0",
        }),
        signToJwsToken: jest.fn().mockResolvedValue("mockJwt"),
      }));
    });

    test("returns 200 and JWT for valid user (Single User Data)", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ name: "validUser" }),
      } as unknown as NextRequest;
      const response = await POST(mockRequest);

      expect(DataVerificationRequest.fromJSON).toHaveBeenCalledWith(
        dvrObject("SingleUserData")
      );

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 200,
        data: mockDvrToken,
      });
      checkHeader();
    });

    test("returns 200 and JWT for valid user (Multiple User Data)", async () => {
      const mockRequest = {
        json: jest
          .fn()
          .mockResolvedValue({ name: "validUser", multiple: true }),
      } as unknown as NextRequest;
      const response = await POST(mockRequest);

      expect(DataVerificationRequest.fromJSON).toHaveBeenCalledWith(
        dvrObject("MultipleUSerData")
      );

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 200,
        data: mockDvrToken,
      });
      checkHeader();
    });

    test("returns 400 for invalid user", async () => {
      const mockRequest = {
        json: jest
          .fn()
          .mockResolvedValue({ name: "invalidUser", multiple: false }),
      } as unknown as NextRequest;
      const response = await POST(mockRequest);

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 400,
        message: "User invalidUser not found",
      });
    });
  });

  describe("GET", () => {
    test("returns the correct response", async () => {
      const response = await GET();

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        data: "get api dvrs",
      });
    });
  });

  describe("OPTIONS", () => {
    test("returns 200 and sets correct headers", async () => {
      const response = await OPTIONS();

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 200,
      });
      checkHeader();
    });
  });
});
