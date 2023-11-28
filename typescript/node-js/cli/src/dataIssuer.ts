/*
 * Filename: /typescript/node-js/cli/src/dataIssuer.ts
 * Path: /typescript/node-js/cli
 * Created Date: Monday, November 27th 2023, 9:07:20 am
 * Author: Naufal Fakhri Muhammad
 *
 * Copyright (c) 2023 DGP Labs. All rights reserved.
 */

import fs from "fs";
import { KeysetEndpoint } from "@didpass/zkpass-client-ts/lib/types";
import { ZkPassClient } from "@didpass/zkpass-client-ts";

//
//  Simulating the REST call to the Data Issuer
//
export class DataIssuer {
  //
  // This function simulates the Data Issuer's getUserDataToken REST API
  //
  public async getUserDataToken(dataFile: string): Promise<string> {
    const ISSUER_PRIVKEY: string =
      "-----BEGIN PRIVATE KEY-----\n" +
      "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3J/wAlzSD8ZyAU8f\n" +
      "bPkuCY/BSlq2Y2S5hym8sRccpZehRANCAATt/RChVSxxwH3IzAcBHuhWT8v5mRfx\n" +
      "moLVnRdNqPcExwyeqH5XN0dlffIYprf66E0CEpZbJ8H+v7cTys9Ie1dd\n" +
      "-----END PRIVATE KEY-----\n";

    let data: string = fs.readFileSync(dataFile, "utf-8");
    console.log(`data=${data}`);

    let dataObj: any = JSON.parse(data);

    let kid: string = "k-1";
    let jku: string =
      "https://gdp-admin.github.io/zkpass-sdk/zkpass/sample-jwks/issuer-key.json";
    let issuerPubkey: KeysetEndpoint = { jku, kid };

    //
    //  Data Issuer's integration points with the zkpass-client SDK library
    //

    //
    // Step 1: Instantiate the zkPassClient object
    //
    let zkPassClient: ZkPassClient = new ZkPassClient();

    //
    // Step 2: Call the zkPassClient.signDataToJwsToken.
    //         This is to digitally-sign the user data.
    //
    let dataToken: string = await zkPassClient.signDataToJwsToken(
      ISSUER_PRIVKEY,
      dataObj,
      issuerPubkey
    );

    return dataToken;
  }
}
