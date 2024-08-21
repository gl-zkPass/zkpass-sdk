/*
 * Issuer.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { KeysetEndpoint, ZkPassClient } from "@didpass/zkpass-client-ts";
import { ZKPASS_ZKVM } from "../utils/constants";
import { UserDataTag } from "../utils/helper";

interface UserData {
  [key: string]: any;
}

export abstract class Issuer {
  //
  // This function simulates the Data Issuer process of signing the user data
  //
  protected async signUserData(
    signingKey: string,
    data: UserData,
    verifyingKeyJws: KeysetEndpoint
  ): Promise<string> {
    //
    // Step 1: Instantiate the zkPassClient object
    //
    const zkPassClient: ZkPassClient = new ZkPassClient({
      zkPassServiceUrl: "",
      zkVm: ZKPASS_ZKVM,
    });

    //
    // Step 2: Call the zkPassClient.signDataToJwsToken.
    //         This is to digitally-sign the user data.
    //
    const dataToken: string = await zkPassClient.signDataToJwsToken(
      signingKey,
      data,
      verifyingKeyJws
    );

    return dataToken;
  }

  abstract getUserDataToken(
    dataFiles: string[],
    dataTags: string[]
  ): Promise<UserDataTag>;
}
