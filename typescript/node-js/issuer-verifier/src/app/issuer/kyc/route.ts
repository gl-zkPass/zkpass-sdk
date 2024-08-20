/*
 * route.ts
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: August 20th 2024
 * -----
 * Last Modified: August 20th 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   NONE
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
  KYC_ISSUER_JWKS_URL,
  KYC_ISSUER_JWKS_KID,
  KYC_ISSUER_PRIVATE_KEY_PEM,
} from "@/utils/constants";
import { signDataToJwsToken } from "@/utils/signing";

const ASSET_PATH = "public/issuer/";
const KYC_RESULT_FILE = "kyc-result.json";

interface KycResult {
  kycId: string;
  kycType: string;
  subject: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  };
  [key: string]: any;
}

export async function POST(req: Request) {
  console.log("*** POST issuer/kyc ***");

  const { name } = await req.json();
  const userName = name;

  const usersFilePath = path.join(process.cwd(), ASSET_PATH, KYC_RESULT_FILE);
  const usersFileContents = fs.readFileSync(usersFilePath, "utf8");
  const kycResults: { [key: string]: KycResult } =
    JSON.parse(usersFileContents);

  if (!kycResults[userName]) {
    return Response.json({
      status: 400,
      message: `Kyc Result for ${userName} is not found`,
    });
  }

  const kycResult = kycResults[userName];

  const signingKey = {
    jwks: {
      jku: KYC_ISSUER_JWKS_URL,
      kid: KYC_ISSUER_JWKS_KID,
    },
    privateKey: KYC_ISSUER_PRIVATE_KEY_PEM,
  };
  const jwt = await signDataToJwsToken(kycResult, signingKey);

  console.log("=== kyc jwt sent ===");
  return _setHeader(NextResponse.json({ status: 200, data: jwt }));
}

export async function GET() {
  return NextResponse.json({ data: "get api kyc" });
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
