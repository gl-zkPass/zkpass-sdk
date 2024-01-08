/*
 * index.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 27th 2023
 * -----
 * Last Modified: January 3rd 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   Nugraha Tejapermana (nugraha.tejapermana@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { MyHolder } from "./MyHolder";
import { MyIssuer } from "./MyIssuer";
import { MyVerifier } from "./MyVerifier";
import { 
  API_KEY,
  ZKPASS_SERVICE_URL 
} from "./utils/constants";

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
    const myVerifier = new MyVerifier();
    const dvrToken = await myVerifier.getDvrToken(dvrFile);

    //
    //  Get the user data from the data issuer
    //
    const myIssuer = new MyIssuer();
    const userDataToken = await myIssuer.getUserDataToken(dataFile);

    //
    //  Generate the zkpassProofToken using user data token & dvr token
    //
    const myHolder = new MyHolder();
    const zkpassProofToken = await myHolder.start(
      userDataToken,
      dvrToken,
      ZKPASS_SERVICE_URL,
      API_KEY
    ).catch((e) => {
      console.error(`Proof generation failed: ${e}`);
      process.exit();
    });;

    //
    //  Verifier verifies the proof
    //
    const queryResult = await myVerifier.verifyZkpassProof(zkpassProofToken);

    console.log(`the query result is ${queryResult.result}`);
  } else {
    console.log("required arguments: <data-file> <rules-file>");
  }
}

main();
