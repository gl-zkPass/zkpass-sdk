/*
 * route.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * Created at: October 31st 2023
 * -----
 * Last Modified: February 29th 2024
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
import { API_KEY, API_SECRET, ZKPASS_SERVICE_URL, ZKPASS_ZKVM } from "@/utils/constants";

export async function POST(req: Request) {
  console.log("*** POST verifier/proofs ***");

  try {
    const API_KEY_OBJ = new ZkPassApiKey(API_KEY ?? "", API_SECRET ?? "");

    const { proof } = await req.json();
    console.log({ proof });
    const myValidator = new MyValidator();

    /**
     * Step 1: Instantiate the zkPassClient object.
     */
    const zkPassClient = new ZkPassClient({
      zkPassServiceUrl: ZKPASS_SERVICE_URL ?? "",
      zkPassApiKey: API_KEY_OBJ,
      zkVm: ZKPASS_ZKVM ?? "",
    });

    /**
     * Step 2: Call zkPassClient.verifyZkPassProof to verify the proof.
     */
    const proofResult = await zkPassClient.verifyZkPassProof(
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
