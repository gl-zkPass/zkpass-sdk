/*
 * Filename: typescript/node-js/issuer-verifier/src/app/verifier/proofs/route.ts
 * Path: typescript/node-js/issuer-verifier
 * Created Date: Tuesday, November 28th 2023, 11:45:27 am
 * Author: Naufal Fakhri Muhammad
 *
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { ZkPassClient } from "@didpass/zkpass-client-ts";
import { MyValidator } from "./proofValidator";

export async function POST(req: Request) {
  console.log("*** POST verifier/proofs ***");

  try {
    const { proof } = await req.json();
    console.log({ proof });
    const myValidator = new MyValidator();

    /**
     * Step 1: Instantiate the zkpassClient object.
     */
    const zkPassClient = new ZkPassClient();

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
