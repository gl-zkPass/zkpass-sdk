/*
 * MyHolder.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: December 21st 2023
 * -----
 * Last Modified: January 2nd 2024
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
import { Holder } from "./libs/Holder";

export class MyHolder extends Holder {
  public async start(
    userDataToken: string,
    dvrToken: string,
    zkPassServiceUrl: string
  ): Promise<string> {
    console.log("\n#### starting zkpass proof generation...");
    const start = Date.now();

    //
    // Step 1: Create zkPass proof
    //         using the userDataToken and dvrToken
    //
    const zkpassProofToken = await this.createZkPassProof(
      zkPassServiceUrl,
      userDataToken,
      dvrToken
    );

    const duration = Date.now() - start;
    console.log(`#### generation completed [time=${duration}ms]`);

    return zkpassProofToken;
  }
}
