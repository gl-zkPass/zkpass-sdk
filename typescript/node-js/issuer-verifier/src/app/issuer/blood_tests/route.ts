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
import { signDataToJwsToken } from "@/utils/signing";
import {
  BLOOD_TEST_ISSUER_JWKS_KID,
  BLOOD_TEST_ISSUER_JWKS_URL,
  BLOOD_TEST_ISSUER_PRIVATE_KEY_PEM,
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

  const signingKey = {
    jwks: {
      jku: BLOOD_TEST_ISSUER_JWKS_URL,
      kid: BLOOD_TEST_ISSUER_JWKS_KID,
    },
    privateKey: BLOOD_TEST_ISSUER_PRIVATE_KEY_PEM,
  };
  const jwt = await signDataToJwsToken(bloodTest, signingKey);

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

function _setHeader(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}
