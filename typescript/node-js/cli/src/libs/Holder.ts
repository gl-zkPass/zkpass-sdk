/*
 * Holder.ts
 *
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
