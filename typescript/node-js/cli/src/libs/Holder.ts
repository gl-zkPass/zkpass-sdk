/*
 * Holder.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: December 19th 2023
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
import { ZkPassClient } from "@didpass/zkpass-client-ts";

export abstract class Holder {
  protected async createZkPassProof(
    zkPassServiceUrl: string,
    userDataToken: string,
    dvrToken: string
  ): Promise<string> {
    console.log("\n#### starting zkpass proof generation...");

    //
    // Step 1: Instantiate the ZkPassClient object.
    //
    const zkpassClient = new ZkPassClient();

    //
    // Step 2: Call the zkpassClient.generateZkpassProof
    //         to get the zkpassProofToken.
    //
    const zkpassProofToken = await zkpassClient.generateZkpassProof(
      zkPassServiceUrl,
      userDataToken,
      dvrToken
    );

    return zkpassProofToken;
  }
}
