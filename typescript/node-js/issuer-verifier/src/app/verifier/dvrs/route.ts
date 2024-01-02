/*
 * route.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * Created at: October 31st 2023
 * -----
 * Last Modified: December 15th 2023
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
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
  ISSUER_JWKS_KID,
  ISSUER_JWKS_URL,
  VERIFIER_JWKS_KID,
  VERIFIER_JWKS_URL,
  VERIFIER_PRIVATE_KEY_PEM,
} from "@/utils/constants";

const ASSET_PATH = "public/verifier/";
const USER_FILE = "users.json";

interface User {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export async function POST(req: Request) {
  console.log("*** POST verifier/dvrs ***");

  const { name } = await req.json();
  const userName = name;

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

  const jwt = await _generateSignedDVR(user);

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

async function _generateSignedDVR(user: User) {
  const API_KEY = new ZkPassApiKey(
    process.env.API_KEY ?? "",
    process.env.API_SECRET ?? ""
  );
  const ZKPASS_SERVICE_URL = process.env.ZKPASS_SERVICE_URL ?? "";

  const issuerVerifyingKeyJKWS = {
    jku: ISSUER_JWKS_URL,
    kid: ISSUER_JWKS_KID,
  };
  const verifierVerifyingKeyJKWS = {
    jku: VERIFIER_JWKS_URL,
    kid: VERIFIER_JWKS_KID,
  };
  const DVR_TITLE = "Onboarding Blood Test";
  const USER_DATA_URL = "http://localhost:3000/verifier";

  const dvrQuery = _generateBloodTestQuery(user);

  /**
   * Step 1: Instantiate the ZkPassClient object.
   */
  const zkPassClient = new ZkPassClient(ZKPASS_SERVICE_URL, API_KEY);

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
    user_data_url: USER_DATA_URL,
    user_data_verifying_key: {
      KeysetEndpoint: issuerVerifyingKeyJKWS,
    },
    dvr_verifying_key: {
      KeysetEndpoint: verifierVerifyingKeyJKWS,
    },
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
  dvrLookup.value.addDVR(data);

  return dvrToken;
}

function _generateBloodTestQuery(user: User): string {
  /**
   * Update this query to match your needs.
   */
  const query = {
    and: [
      {
        "==": ["lab.ID", "QH801874"],
      },
      {
        "==": ["testID", "SCREEN-7083-12345"],
      },
      {
        "~==": ["subject.firstName", user.firstName],
      },
      {
        "~==": ["subject.lastName", user.lastName],
      },
      {
        "==": ["subject.dateOfBirth", user.dateOfBirth],
      },
      {
        "<=": ["measuredPanelsNgML.cocaine", 10],
      },
    ],
  };

  return JSON.stringify(query);
}
