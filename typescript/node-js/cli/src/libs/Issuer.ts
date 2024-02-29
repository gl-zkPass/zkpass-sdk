/*
 * Issuer.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: December 19th 2023
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

import { KeysetEndpoint, ZkPassClient } from "@didpass/zkpass-client-ts";
import { ZKPASS_ZKVM } from "../utils/constants";

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
      zkVm: ZKPASS_ZKVM
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

  abstract getUserDataToken(dataFile: string): Promise<string>
}
