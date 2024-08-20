/*
 * Holder.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: December 19th 2023
 * -----
 * Last Modified: August 20th 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
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
import { UserDataTag } from "../utils/helper";

export abstract class Holder {
  protected async createZkPassProof(
    zkPassServiceUrl: string,
    apiKey: ZkPassApiKey,
    zkPassZkvm: string,
    userDataToken: UserDataTag,
    dvrToken: string
  ): Promise<string> {
    //
    // Step 1: Instantiate the ZkPassClient object.
    //
    const zkPassClient = new ZkPassClient({
      zkPassServiceUrl: zkPassServiceUrl,
      zkPassApiKey: apiKey,
      zkVm: zkPassZkvm,
    });

    //
    // Step 2: Call the zkPassClient.generateZkPassProof
    //         to get the zkPassProofToken.
    //
    const zkPassProofToken = await zkPassClient.generateZkPassProof(
      userDataToken,
      dvrToken
    );

    return zkPassProofToken;
  }

  abstract start(
    userDataToken: UserDataTag,
    dvrToken: string,
    zkPassServiceUrl: string,
    apiKey: ZkPassApiKey,
    zkPassZkvm: string
  ): Promise<string>;
}
