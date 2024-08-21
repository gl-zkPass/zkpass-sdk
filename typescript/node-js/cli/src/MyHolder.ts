/*
 * MyHolder.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { ZkPassApiKey } from "@didpass/zkpass-client-ts";
import { Holder } from "./libs/Holder";
import { UserDataTag } from "./utils/helper";

export class MyHolder extends Holder {
  public async start(
    userDataToken: UserDataTag,
    dvrToken: string,
    zkPassServiceUrl: string,
    apiKey: ZkPassApiKey,
    zkPassZkvm: string,
  ): Promise<string> {
    console.log("\n#### starting zkPass proof generation...");
    const start = Date.now();

    //
    // Step 1: Create zkPass proof
    //         using the userDataToken and dvrToken
    //
    const zkPassProofToken = await this.createZkPassProof(
      zkPassServiceUrl,
      apiKey,
      zkPassZkvm,
      userDataToken,
      dvrToken,
    );

    const duration = Date.now() - start;
    console.log(`#### generation completed [time=${duration}ms]`);

    return zkPassProofToken;
  }
}
