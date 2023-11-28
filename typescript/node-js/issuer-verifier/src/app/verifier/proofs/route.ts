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
 *   
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { ZkPassClient } from "@didpass/zkpass-client-ts";
import { MyValidator } from "./proofValidator";

export async function POST(req: Request) {
  console.log("*** POST verifier/proofs ***");

  try {
    const { proof } = await req.json();
    console.log({ proof });
    /**
     * Step 1
     * Create a validator class that implements ZkPassProofMetadataValidator
     */
    const myValidator = new MyValidator();
    /**
     * Step 2
     * Validate the proof
     */
    const zkPassClient = new ZkPassClient();
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
