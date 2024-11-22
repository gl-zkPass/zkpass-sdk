/*
 * index.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { MyHolder } from "./MyHolder";
import { MyIssuer } from "./MyIssuer";
import { MyVerifier } from "./MyVerifier";
import {
  KEY,
  SECRET,
  ZKPASS_SERVICE_URL,
  ZKPASS_ZKVM,
} from "./utils/constants";
import { getTagsFromArgs, readUserDataFromArgs } from "./utils/helper";

async function main() {
  const args: string[] = process.argv.slice(2);
  console.log("=== main ===");
  console.log({ args });
  if (args.length >= 2) {
    const dataFiles = readUserDataFromArgs(args);
    const dvrFile = args[args.length - 1];
    const dataTags = getTagsFromArgs(dataFiles);

    //
    //  Get the dvr from the verifier
    //
    const myVerifier = new MyVerifier();
    const dvrToken = myVerifier.getDvrToken(dvrFile, dataTags);

    //
    //  Get the user data from the data issuer
    //
    const myIssuer = new MyIssuer();
    const userDataToken = myIssuer.getUserDataToken(dataFiles, dataTags);

    //
    //  Generate the zkPassProofToken using user data token & dvr token
    //
    const myHolder = new MyHolder();
    const zkPassProofToken = myHolder.start(
      userDataToken,
      dvrToken,
      ZKPASS_SERVICE_URL,
      KEY,
      SECRET,
      ZKPASS_ZKVM
    );

    //
    //  Verifier verifies the proof
    //
    const queryResult = myVerifier.verifyZkPassProof(zkPassProofToken);

    console.log(`the query result is ${queryResult.output.result}`);
    console.log(queryResult.output);
  } else {
    console.log("required arguments: <data-file>(s) <rules-file>");
  }
}

main();
