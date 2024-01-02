/*
 * route.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * Created at: October 31st 2023
 * -----
 * Last Modified: November 28th 2023
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { ZkPassApiKey, ZkPassClient } from "@didpass/zkpass-client-ts";
import { MyValidator } from "./proofValidator";

export async function POST(req: Request) {
  console.log("*** POST verifier/proofs ***");

  try {
    const API_KEY = new ZkPassApiKey(
      process.env.API_KEY ?? "",
      process.env.API_SECRET ?? ""
    );
    const ZKPASS_SERVICE_URL = process.env.ZKPASS_SERVICE_URL ?? "";

    const { proof } = await req.json();
    console.log({ proof });
    const myValidator = new MyValidator();

    /**
     * Step 1: Instantiate the zkpassClient object.
     */
    const zkPassClient = new ZkPassClient(ZKPASS_SERVICE_URL, API_KEY);

    /**
     * Step 2: Call zkpassClient.verifyZkpassProof to verify the proof.
     */
    const proofResult = await zkPassClient.verifyZkpassProof(
      proof,
      myValidator
    );
    console.log({ proofResult });

    console.log("=== proof OK result sent ===");
    return Response.json({ status: 200, data: proofResult });
  } catch (error) {
    console.log({ error });
    console.log("=== proof Error result sent ===");
    return Response.json({ status: 400, message: "Error validating proof" });
  }
}

export async function GET() {
  return Response.json({ data: "get api proofs" });
}
