/*
 * Holder.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { UserDataTag } from "../utils/helper";
import { DvrModuleClient } from "@zkpass/dvr-client-ts";

export abstract class Holder {
  protected createZkPassProof(
    zkPassServiceUrl: string,
    apiKey: string,
    secretApiKey: string,
    userDataToken: UserDataTag,
    dvrToken: string
  ): string {
    //
    // Step 1: Instantiate the DVR module client object.
    //
    const dvrModuleClient = new DvrModuleClient({
      baseUrl: zkPassServiceUrl,
      apiKey: apiKey,
      secretApiKey: secretApiKey,
    });

    //
    // Step 2: Call the DVR module client's callDvrGenerateZkPassProof
    //         to get the zkPassProofToken.
    //
    return dvrModuleClient.callDvrGenerateZkPassProof(
      JSON.stringify(userDataToken),
      dvrToken
    );
  }

  abstract start(
    userDataToken: UserDataTag,
    dvrToken: string,
    zkPassServiceUrl: string,
    apiKey: string,
    secretApiKey: string,
    zkPassZkvm: string
  ): string;
}
