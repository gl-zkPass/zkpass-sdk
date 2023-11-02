import { verifyZkpassProof } from "zkpass-client-ts";
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
    const proofResult = await verifyZkpassProof(proof, myValidator);
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
