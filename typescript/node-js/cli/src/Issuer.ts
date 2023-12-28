/*
 * dataIssuer.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 27th 2023, 9:07:20 am
 * -----
 * Last Modified: December 28th 2023, 9:07:20 am
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

import fs from "fs";
import { KeysetEndpoint, ZkPassClient } from "@didpass/zkpass-client-ts";

//
//  Simulating the REST call to the Data Issuer
//
export class Issuer {
  constructor(
    private ISSUER_PRIVKEY: string,
    private KID: string,
    private JKU: string
  ) {}
  //
  // This function simulates the Data Issuer's getUserDataToken REST API
  //
  public async getUserDataToken(dataFile: string): Promise<string> {
    const ENCODING = "utf-8";
    const data: string = fs.readFileSync(dataFile, ENCODING);
    console.log(`data=${data}`);

    const dataObj: any = JSON.parse(data);

    const issuerPubkey: KeysetEndpoint = { jku: this.JKU, kid: this.KID };

    //
    //  Data Issuer's integration points with the zkpass-client SDK library
    //

    //
    // Step 1: Instantiate the zkPassClient object
    //
    const zkPassClient: ZkPassClient = new ZkPassClient("");

    //
    // Step 2: Call the zkPassClient.signDataToJwsToken.
    //         This is to digitally-sign the user data.
    //
    const dataToken: string = await zkPassClient.signDataToJwsToken(
      this.ISSUER_PRIVKEY,
      dataObj,
      issuerPubkey
    );

    return dataToken;
  }
}
