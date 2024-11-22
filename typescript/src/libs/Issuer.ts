/*
 * Issuer.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { KEY, SECRET, ZKPASS_SERVICE_URL } from "../utils/constants";
import { UserDataTag } from "../utils/helper";
import {
  DvrModuleClient,
  PublicKeyOrKeysetEndpoint,
} from "@zkpass/dvr-client-ts";

interface UserData {
  [key: string]: any;
}

export abstract class Issuer {
  //
  // This function simulates the Data Issuer process of signing the user data
  //
  protected signUserData(
    signingKey: string,
    data: UserData,
    verifyingKeyJws: PublicKeyOrKeysetEndpoint
  ): string {
    //
    // Step 1: Instantiate the DVR module client object
    //
    const dvrModuleClient = new DvrModuleClient({
      baseUrl: ZKPASS_SERVICE_URL,
      apiKey: KEY,
      secretApiKey: SECRET,
    });

    //
    // Step 2: Call the DVR module client's callDvrGenerateUserDataToken
    //         This is to digitally-sign the user data.
    //
    return dvrModuleClient.callDvrGenerateUserDataToken(
      signingKey,
      JSON.stringify(data),
      verifyingKeyJws
    );
  }

  abstract getUserDataToken(
    dataFiles: string[],
    dataTags: string[]
  ): UserDataTag;
}
