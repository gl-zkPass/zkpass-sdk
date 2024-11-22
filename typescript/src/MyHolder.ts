/*
 * MyHolder.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { Holder } from "./libs/Holder";
import { UserDataTag } from "./utils/helper";

export class MyHolder extends Holder {
  public start(
    userDataToken: UserDataTag,
    dvrToken: string,
    zkPassServiceUrl: string,
    apiKey: string,
    secretApiKey: string,
    zkPassZkvm: string
  ): string {
    console.log("\n#### starting zkPass proof generation...");
    console.log("#### zkPassServiceUrl:", zkPassServiceUrl);
    console.log("#### zkvm:", zkPassZkvm);
    const start = Date.now();

    //
    // Create zkPass proof
    // using the userDataToken and dvrToken
    //
    const zkPassProofToken = this.createZkPassProof(
      zkPassServiceUrl,
      apiKey,
      secretApiKey,
      userDataToken,
      dvrToken
    );

    const duration = Date.now() - start;
    console.log(`#### generation completed [time=${duration}ms]`);

    return zkPassProofToken;
  }
}
