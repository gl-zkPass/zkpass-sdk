/*
 * route.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  ZkPassClient,
  DataVerificationRequest,
  ZkPassApiKey,
} from "@didpass/zkpass-client-ts";
import { v4 as uuidv4 } from "uuid";
import { dvrLookup } from "./dvrHelper";
import {
  VERIFIER_JWKS_KID,
  VERIFIER_JWKS_URL,
  VERIFIER_PRIVATE_KEY_PEM,
  API_KEY,
  API_SECRET,
  ZKPASS_SERVICE_URL,
  ZKPASS_ZKVM,
  BLOOD_TEST_ISSUER_JWKS_URL,
  BLOOD_TEST_ISSUER_JWKS_KID,
  KYC_ISSUER_JWKS_URL,
  KYC_ISSUER_JWKS_KID,
} from "@/utils/constants";
import { UserDataRequests } from "@didpass/zkpass-client-ts/lib/src/classes/userDataRequest";

const ASSET_PATH = "public/verifier/";
const USER_FILE = "users.json";

interface User {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export async function POST(req: Request) {
  console.log("*** POST verifier/dvrs ***");

  const { name, multiple } = await req.json();
  const userName = name;
  const usingMultipleUserData = multiple === undefined ? false : multiple;

  const usersFilePath = path.join(process.cwd(), ASSET_PATH, USER_FILE);
  const usersFileContents = fs.readFileSync(usersFilePath, "utf8");
  const users: { [key: string]: User } = JSON.parse(usersFileContents);

  if (!users[userName]) {
    return Response.json({
      status: 400,
      message: `User ${userName} not found`,
    });
  }

  const user = users[userName];

  const jwt = await _generateSignedDVR(user, usingMultipleUserData);

  console.log("=== dvr sent ===");
  return _setHeader(NextResponse.json({ status: 200, data: jwt }));
}

export async function GET() {
  return Response.json({ data: "get api dvrs" });
}

export async function OPTIONS() {
  let response = _setHeader(NextResponse.json({ status: 200 }));
  return response;
}

function _setHeader(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

async function _generateSignedDVR(user: User, usingMultipleUserData: boolean) {
  const API_KEY_OBJ = new ZkPassApiKey(API_KEY ?? "", API_SECRET ?? "");

  const verifierVerifyingKeyJKWS = {
    jku: VERIFIER_JWKS_URL,
    kid: VERIFIER_JWKS_KID,
  };
  const DVR_TITLE = "Onboarding Blood Test";

  const dvrQuery = _generateDvrQuery(user, usingMultipleUserData);
  const userDataRequests = _generateUserDataRequests(usingMultipleUserData);

  /**
   * Step 1: Instantiate the ZkPassClient object.
   */
  const zkPassClient = new ZkPassClient({
    zkPassServiceUrl: ZKPASS_SERVICE_URL ?? "",
    zkPassApiKey: API_KEY_OBJ,
    zkVm: ZKPASS_ZKVM ?? "",
  });

  /**
   * Step 2: Call zkPassClient.getQueryEngineVersionInfo.
   *         The version info is needed for DVR object creation.
   */
  const { queryEngineVersion, queryMethodVersion } =
    await zkPassClient.getQueryEngineVersionInfo();

  /**
   * Step 3: Create the DVR object.
   */
  const data = DataVerificationRequest.fromJSON({
    dvr_title: DVR_TITLE,
    dvr_id: uuidv4(),
    query_engine_ver: queryEngineVersion,
    query_method_ver: queryMethodVersion,
    query: dvrQuery,
    user_data_requests: userDataRequests,
    dvr_verifying_key: {
      KeysetEndpoint: verifierVerifyingKeyJKWS,
    },
    zkvm: ZKPASS_ZKVM,
  });

  /**
   * Step 4: Call zkPassClient.signToJwsToken.
   *         to digitally-sign the dvr data.
   */
  const dvrToken = await data.signToJwsToken(
    VERIFIER_PRIVATE_KEY_PEM,
    verifierVerifyingKeyJKWS
  );

  console.log({ DataVerificationRequest: data });
  // Save the dvr to a global hash table
  // This will be needed by the validator to check the proof metadata
  dvrLookup.value.addDvr(data);

  return dvrToken;
}

function _generateUserDataRequests(
  usingMultipleUserData: boolean
): UserDataRequests {
  const USER_DATA_URL = "http://localhost:3000/verifier";
  const bloodTestIssuerVerifyingKeyJKWS = {
    jku: BLOOD_TEST_ISSUER_JWKS_URL,
    kid: BLOOD_TEST_ISSUER_JWKS_KID,
  };
  const kycIssuerVerifyingKeyJKWS = {
    jku: KYC_ISSUER_JWKS_URL,
    kid: KYC_ISSUER_JWKS_KID,
  };
  if (usingMultipleUserData) {
    return {
      blood_test: {
        user_data_url: USER_DATA_URL,
        user_data_verifying_key: {
          KeysetEndpoint: bloodTestIssuerVerifyingKeyJKWS,
        },
      },
      kyc: {
        user_data_url: USER_DATA_URL,
        user_data_verifying_key: {
          KeysetEndpoint: kycIssuerVerifyingKeyJKWS,
        },
      },
    };
  } else {
    return {
      "": {
        user_data_url: USER_DATA_URL,
        user_data_verifying_key: {
          KeysetEndpoint: bloodTestIssuerVerifyingKeyJKWS,
        },
      },
    };
  }
}

function _generateDvrQuery(user: User, usingMultipleUserData: boolean): string {
  if (usingMultipleUserData) {
    return _generateMultipleUserDataQuery(user);
  } else {
    return _generateBloodTestQuery(user);
  }
}

function _generateBloodTestQuery(user: User): string {
  /**
   * Update this query to match your needs.
   */
  const query = [
    {
      assign: {
        lab_id: { "==": [{ dvar: "lab.ID" }, "QH801874"] },
      },
    },
    {
      assign: {
        test_id: {
          "==": [{ dvar: "testID" }, "SCREEN-7083-12345"],
        },
      },
    },
    {
      assign: {
        subject_first_name: {
          "~==": [{ dvar: "subject.firstName" }, user.firstName],
        },
      },
    },
    {
      assign: {
        subject_last_name: {
          "~==": [{ dvar: "subject.lastName" }, user.lastName],
        },
      },
    },
    {
      assign: {
        subject_date_of_birth: {
          "==": [{ dvar: "subject.dateOfBirth" }, user.dateOfBirth],
        },
      },
    },
    {
      assign: {
        measuredPanelsNgML_cocaine: {
          "<=": [{ dvar: "measuredPanelsNgML.cocaine" }, 10],
        },
      },
    },
    {
      assign: {
        test_passed: {
          and: [
            { lvar: "lab_id" },
            { lvar: "test_id" },
            { lvar: "subject_first_name" },
            { lvar: "subject_last_name" },
            { lvar: "subject_date_of_birth" },
            { lvar: "measuredPanelsNgML_cocaine" },
          ],
        },
      },
    },
    { output: { result: { lvar: "test_passed" } } },
  ];

  return JSON.stringify(query);
}

function _generateMultipleUserDataQuery(user: User): string {
  /**
   * Update this query to match your needs.
   */
  const query = [
    {
      assign: {
        lab_id: { "==": [{ dvar: "blood_test.lab.ID" }, "QH801874"] },
      },
    },
    {
      assign: {
        test_id: {
          "==": [{ dvar: "blood_test.testID" }, "SCREEN-7083-12345"],
        },
      },
    },
    {
      assign: {
        subject_first_name: {
          "~==": [{ dvar: "blood_test.subject.firstName" }, user.firstName],
        },
      },
    },
    {
      assign: {
        subject_last_name: {
          "~==": [{ dvar: "blood_test.subject.lastName" }, user.lastName],
        },
      },
    },
    {
      assign: {
        subject_date_of_birth: {
          "==": [{ dvar: "blood_test.subject.dateOfBirth" }, user.dateOfBirth],
        },
      },
    },
    {
      assign: {
        measuredPanelsNgML_cocaine: {
          "<=": [{ dvar: "blood_test.measuredPanelsNgML.cocaine" }, 10],
        },
      },
    },
    {
      assign: {
        matchKycId: {
          "==": [
            { dvar: "blood_test.subject.kyc.kycId" },
            { dvar: "kyc.kycId" },
          ],
        },
      },
    },
    {
      assign: {
        matchKycType: {
          "==": [
            { dvar: "blood_test.subject.kyc.kycType" },
            { dvar: "kyc.kycType" },
          ],
        },
      },
    },
    {
      assign: {
        matchDateOfBirth: {
          "==": [
            { dvar: "blood_test.subject.dateOfBirth" },
            { dvar: "kyc.subject.dateOfBirth" },
          ],
        },
      },
    },
    {
      assign: {
        test_passed: {
          and: [
            { lvar: "lab_id" },
            { lvar: "test_id" },
            { lvar: "subject_first_name" },
            { lvar: "subject_last_name" },
            { lvar: "subject_date_of_birth" },
            { lvar: "measuredPanelsNgML_cocaine" },
            { lvar: "matchKycId" },
            { lvar: "matchKycType" },
            { lvar: "matchDateOfBirth" },
          ],
        },
      },
    },
    { output: { result: { lvar: "test_passed" } } },
  ];

  return JSON.stringify(query);
}
