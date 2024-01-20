/*
 * route.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * Created Date: October 31st 2023
 * -----
 * Last Modified: January 11th 2024
 * Modified By: handrianalandi (handrian.alandi@gdplabs.id)
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
import { ZkPassApiKey, ZkPassClient } from "@didpass/zkpass-client-ts";
import {
  ISSUER_JWKS_KID,
  ISSUER_JWKS_URL,
  ISSUER_PRIVATE_KEY_PEM,
  API_KEY,
  API_SECRET,
  ZKPASS_SERVICE_URL
} from "@/utils/constants";

const ASSET_PATH = "public/issuer/";
const BLOOD_TEST_FILE = "blood-tests.json";

interface BloodTest {
  testId: string;
  lab: {
    ID: string;
  };
  subject: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  };
  measuredPanelsNgML: {
    cocaine: string;
  };
  [key: string]: any;
}

export async function POST(req: Request) {
  console.log("*** POST issuer/blood_tests ***");

  const { name } = await req.json();
  const userName = name;

  const usersFilePath = path.join(process.cwd(), ASSET_PATH, BLOOD_TEST_FILE);
  const usersFileContents = fs.readFileSync(usersFilePath, "utf8");
  const bloodTests: { [key: string]: BloodTest } =
    JSON.parse(usersFileContents);

  if (!bloodTests[userName]) {
    return Response.json({
      status: 400,
      message: `Blood test for ${userName} is not found`,
    });
  }

  const bloodTest = bloodTests[userName];

  const jwt = await _signBloodTest(bloodTest);

  console.log("=== blood_test jwt sent ===");
  return _setHeader(NextResponse.json({ status: 200, data: jwt }));
}

export async function GET() {
  return NextResponse.json({ data: "get api blood_tests" });
}

export async function OPTIONS() {
  let response = _setHeader(NextResponse.json({ status: 200 }));
  return response;
}

async function _signBloodTest(data: { [key: string]: any }) {
  const API_KEY_OBJ = new ZkPassApiKey(
    API_KEY ?? "",
    API_SECRET ?? ""
  );

  const verifyingKeyJKWS = {
    jku: ISSUER_JWKS_URL,
    kid: ISSUER_JWKS_KID,
  };

  /**
   * Step 1: Instantiate the zkPassClient object
   */
  const zkPassClient = new ZkPassClient(ZKPASS_SERVICE_URL ?? "", API_KEY_OBJ);

  /**
   * Step 2: Call the zkPassClient.signDataToJwsToken.
   *         This is to digitally-sign the user data.
   */
  const dataToken = await zkPassClient.signDataToJwsToken(
    ISSUER_PRIVATE_KEY_PEM,
    data,
    verifyingKeyJKWS
  );

  return dataToken;
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
