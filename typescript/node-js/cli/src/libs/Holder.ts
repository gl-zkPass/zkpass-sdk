/*
 * Holder.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: December 19th 2023
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
import { ZkPassApiKey, ZkPassClient } from "@didpass/zkpass-client-ts";

export abstract class Holder {
  protected async createZkPassProof(
    zkPassServiceUrl: string,
    apiKey: ZkPassApiKey,
    userDataToken: string,
    dvrToken: string
  ): Promise<string> {
    console.log("\n#### starting zkpass proof generation...");

    //
    // Step 1: Instantiate the ZkPassClient object.
    //
    const zkpassClient = new ZkPassClient(zkPassServiceUrl, apiKey);

    //
    // Step 2: Call the zkpassClient.generateZkpassProof
    //         to get the zkpassProofToken.
    //
    const zkpassProofToken = await zkpassClient.generateZkpassProof(
      userDataToken,
      dvrToken
    );

    return zkpassProofToken;
  }
}
