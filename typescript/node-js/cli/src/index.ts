/*
 * index.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 27th 2023
 * -----
 * Last Modified: December 14th 2023, 9:07:20 am
 * Modified By: GDPWinnerPranata (winner.pranata@gdplabs.id)
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
import { Holder } from "./Holder";
import { Issuer } from "./Issuer";
import {
  API_KEY,
  EXPECTED_DVR_TTL,
  ISSUER_JKU,
  ISSUER_KID,
  ISSUER_PRIVKEY,
  VERIFIER_JKU,
  VERIFIER_KID,
  VERIFIER_PRIVKEY,
  ZKPASS_SERVICE_URL,
} from "./utils/constants";
import { Verifier } from "./Verifier";

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
    const verifier = new Verifier(
      VERIFIER_PRIVKEY,
      ISSUER_KID,
      ISSUER_JKU,
      VERIFIER_KID,
      VERIFIER_JKU,
      EXPECTED_DVR_TTL
    );
    const dvrToken = await verifier.getDvrToken(dvrFile);

    //
    //  Get the user data from the data issuer
    //
    const issuer = new Issuer(ISSUER_PRIVKEY, ISSUER_KID, ISSUER_JKU);
    const userDataToken = await issuer.getUserDataToken(dataFile);

    //
    //  Generate the zkpassProofToken using user data token & dvr token
    //
    const holder = new Holder();
    const zkpassProofToken = await holder.getProofToken(
      userDataToken,
      dvrToken,
      ZKPASS_SERVICE_URL,
      API_KEY
    );

    //
    //  Verifier verifies the proof
    //
    const queryResult = await verifier.verifyZkpassProof(zkpassProofToken);

    console.log(`the query result is ${queryResult.result}`);
  } else {
    console.log("required arguments: <data-file> <rules-file>");
  }
}

main();
