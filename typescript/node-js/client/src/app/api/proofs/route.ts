/*
 * route.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { NextResponse } from "next/server";
import { ZkPassApiKey, ZkPassClient } from "@didpass/zkpass-client-ts";
import {
  API_KEY,
  API_SECRET,
  ZKPASS_SERVICE_URL,
  ZKPASS_ZKVM,
} from "@/utils/constants";

export async function POST(req: Request) {
  try {
    const API_KEY_OBJ = new ZkPassApiKey(API_KEY ?? "", API_SECRET ?? "");

    // The Kyc value will be null / undefined if we only use single user data
    const { dvr, blood_test, kyc } = await req.json();
    console.log({ dvr, blood_test, kyc });
    const userDataTokens = generateUserDataTokens(blood_test, kyc);

    /**
     * Step 1: Instantiate the ZkPassClient object.
     */
    const zkPassClient = new ZkPassClient({
      zkPassServiceUrl: ZKPASS_SERVICE_URL ?? "",
      zkPassApiKey: API_KEY_OBJ,
      zkVm: ZKPASS_ZKVM ?? "",
    });

    /**
     * Step 2: Call the zkPassClient.generateZkPassProof
     *         to get the zkPassProofToken.
     */
    const proof = await zkPassClient.generateZkPassProof(userDataTokens, dvr);
    console.log({ proof });
    return Response.json({ status: 200, data: proof });
  } catch (error) {
    console.log("== Error generating proof ==");
    console.log({ error });
    return Response.json({ status: 200, message: "Error generating proof" });
  }
}

export async function OPTIONS() {
  let response = NextResponse.json({ status: 200 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

function generateUserDataTokens(blood_test: any, kyc: any) {
  const userDataTokens: { [tag: string]: string } = {};
  if (kyc) {
    userDataTokens["blood_test"] = blood_test;
    userDataTokens["kyc"] = kyc;
  } else {
    userDataTokens[""] = blood_test;
  }
  return userDataTokens;
}
