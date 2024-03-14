/*
 * MyHolder.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: December 21st 2023
 * -----
 * Last Modified: February 29th 2024
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
import { ZkPassApiKey } from "@didpass/zkpass-client-ts";
import { Holder } from "./libs/Holder";

export class MyHolder extends Holder {
  public async start(
    userDataToken: string,
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
