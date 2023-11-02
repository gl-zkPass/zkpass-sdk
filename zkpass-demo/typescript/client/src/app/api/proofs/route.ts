import { NextResponse } from "next/server";
import { generateZkpassProof } from "zkpass-client-ts";

export async function POST(req: Request) {
  try {
    const { dvr, blood_test } = await req.json();
    console.log({ dvr, blood_test });

    /**
     * Step 1
     * Provide url to the zkpass service.
     */
    const zkPassServiceURL = "https://stag-zkpass-ws.ssi.id/proof";

    /**
     * Step 2
     * Generate the proof from blood_test and dvr
     */
    const proofResponseBody = await generateZkpassProof(
      zkPassServiceURL,
      blood_test,
      dvr
    );

    console.log({ proofResponseBody });
    return Response.json({ status: 200, data: proofResponseBody.proof });
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
