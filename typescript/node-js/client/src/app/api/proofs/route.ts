/*
 * Filename: typescript/node-js/client/src/app/api/proofs/route.ts
 * Path: typescript/node-js/client
 * Created Date: Tuesday, November 28th 2023, 11:45:27 am
 * Author: Naufal Fakhri Muhammad
 *
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { NextResponse } from "next/server";
import { ZkPassClient } from "@didpass/zkpass-client-ts";

export async function POST(req: Request) {
  try {
    const { dvr, blood_test } = await req.json();
    console.log({ dvr, blood_test });

    const zkPassServiceURL = "https://playground-zkpass.ssi.id/proof";

    /**
     * Step 1: Instantiate the ZkPassClient object.
     */
    const zkPassClient = new ZkPassClient();
    /**
     * Step 2: Call the zkpassClient.generateZkpassProof
     *         to get the zkpassProofToken.
     */
    const proof = await zkPassClient.generateZkpassProof(
      zkPassServiceURL,
      blood_test,
      dvr
    );
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
