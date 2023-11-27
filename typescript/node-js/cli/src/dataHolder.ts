import { ZkPassClient } from "@didpass/zkpass-client-ts";
import { DataIssuer } from "./dataIssuer";
import { ProofVerifier } from "./proofVerifier";

export class DataHolder {
  public async start(dataFile: string, dvrFile: string): Promise<void> {
    //
    //  Get the user data from the data issuer
    //
    const dataIssuer = new DataIssuer();
    const userDataToken = await dataIssuer.getUserDataToken(dataFile);

    //
    //  Get the dvr from the verifier
    //
    const proofVerifier = new ProofVerifier();
    const dvrToken = await proofVerifier.getDvrToken(dvrFile);

    const zkpassServiceUrl = "https://playground-zkpass.ssi.id/proof";
    console.log("\n#### starting zkpass proof generation...");
    const start = Date.now();

    //
    //  Data Holder's integration points with the zkpass-client SDK library
    //

    //
    // Step 1: Instantiate the zkpass_client object.
    //
    const zkpassClient = new ZkPassClient();

    //
    // Step 2: Call the zkpassClient.generateZkpassProof
    //         to get the zkpassProofToken.
    //
    const zkpassProofToken = await zkpassClient.generateZkpassProof(
      zkpassServiceUrl,
      userDataToken,
      dvrToken
    );

    const duration = Date.now() - start;
    console.log(`#### generation completed [time=${duration}ms]`);

    //
    //  Step 3: Send the zkpassProofToken to the Proof Verifier
    //          to get the proof verified and retrieve the query result.
    //
    const queryResult = await proofVerifier.verifyZkpassProof(zkpassProofToken);

    console.log(`the query result is ${queryResult}`);
  }
}
