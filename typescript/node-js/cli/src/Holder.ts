/*
 * dataHolder.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 27th 2023
 * -----
 * Last Modified: December 22nd 2023, 9:07:20 am
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
import { ZkPassClient } from "@didpass/zkpass-client-ts";

export class Holder {
  public async getProofToken(
    userDataToken: string,
    dvrToken: string,
    zkPassServiceUrl: string,
    apiKey: {
      key: string;
      secret: string;
    }
  ): Promise<string> {
    try {
      console.log("\n#### starting zkpass proof generation...");
      const start = Date.now();

      //
      //  Data Holder's integration points with the zkpass-client SDK library
      //

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
        dvrToken,
        apiKey
      );

      const duration = Date.now() - start;
      console.log(`#### generation completed [time=${duration}ms]`);

      return zkpassProofToken;
    } catch (error) {
      console.log("#### DataHolder: error");
      console.log({ error });
    }
  }
}
