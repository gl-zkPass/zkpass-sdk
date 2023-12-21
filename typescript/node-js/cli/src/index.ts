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
import { MyHolder } from "./MyHolder";
import { MyIssuer } from "./MyIssuer";
import { MyVerifier } from "./MyVerifier";
import {
  ISSUER_JKU,
  ISSUER_KID,
  ISSUER_PRIVKEY,
  VERIFIER_JKU,
  VERIFIER_KID,
  VERIFIER_PRIVKEY,
  ZKPASS_SERVICE_URL,
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
      ZKPASS_SERVICE_URL
    );

    //
    //  Verifier verifies the proof
    //
    const queryResult = await myVerifier.verifyZkpassProof(zkpassProofToken);

    console.log(`the query result is ${queryResult}`);
  } else {
    console.log("required arguments: <data-file> <rules-file>");
  }
}

main();
