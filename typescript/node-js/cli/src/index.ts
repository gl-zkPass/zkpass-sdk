/*
 * index.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 27th 2023
 * -----
 * Last Modified: November 29th 2023
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   Nugraha Tejapermana (nugraha.tejapermana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { DataHolder } from "./dataHolder";
import { DataIssuer } from "./dataIssuer";
import { ProofVerifier } from "./proofVerifier";

async function main() {
  const args: string[] = process.argv.slice(2);
  console.log("=== main ===");
  console.log({ args });
  if (args.length === 2) {
    const dataFile = args[0];
    const dvrFile = args[1];

    //
    //  Get the dvr from the verifier
    //
    const proofVerifier = new ProofVerifier();
    const dvrToken = await proofVerifier.getDvrToken(dvrFile);

    //
    //  Get the user data from the data issuer
    //
    const dataIssuer = new DataIssuer();
    const userDataToken = await dataIssuer.getUserDataToken(dataFile);

    //
    //  Generate the zkpassProofToken using user data token & dvr token
    //
    const dataHolder = new DataHolder();
    const zkpassProofToken = await dataHolder.getProofToken(
      userDataToken,
      dvrToken
    );

    //
    //  Verifier verifies the proof
    //
    const queryResult = await proofVerifier.verifyZkpassProof(zkpassProofToken);

    console.log(`the query result is ${queryResult}`);
  } else {
    console.log("required arguments: <data-file> <rules-file>");
  }
}

main();
