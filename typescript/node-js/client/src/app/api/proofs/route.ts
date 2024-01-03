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

import { NextResponse } from "next/server";
import { ZkPassApiKey, ZkPassClient } from "@didpass/zkpass-client-ts";

export async function POST(req: Request) {
  try {
    const API_KEY = new ZkPassApiKey(
      process.env.API_KEY ?? "",
      process.env.API_SECRET ?? ""
    );
    const ZKPASS_SERVICE_URL = process.env.ZKPASS_SERVICE_URL ?? "";

    const { dvr, blood_test } = await req.json();
    console.log({ dvr, blood_test });

    /**
     * Step 1: Instantiate the ZkPassClient object.
     */
    const zkPassClient = new ZkPassClient(ZKPASS_SERVICE_URL, API_KEY);

    /**
     * Step 2: Call the zkpassClient.generateZkpassProof
     *         to get the zkpassProofToken.
     */
    const proof = await zkPassClient.generateZkpassProof(blood_test, dvr);
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
