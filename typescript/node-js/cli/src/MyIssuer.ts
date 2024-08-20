/*
 * MyIssuer.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: December 21st 2023
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

import fs from "fs";
import { Issuer } from "./libs/Issuer";
import { ISSUER_JKU, ISSUER_KID, ISSUER_PRIVKEY } from "./utils/constants";
import { KeysetEndpoint } from "@didpass/zkpass-client-ts";
import { UserDataTag } from "./utils/helper";

export class MyIssuer extends Issuer {
  public async getUserDataToken(
    dataFiles: string[],
    dataTags: string[]
  ): Promise<UserDataTag> {
    const dataToken: UserDataTag = {};
    for (let index = 0; index < dataFiles.length; index++) {
      const dataFile = dataFiles[index];

      const ENCODING = "utf-8";
      const data: string = fs.readFileSync(dataFile, ENCODING);
      console.log(`data ${dataTags[index]}=${data}`);

      const dataObj: any = JSON.parse(data);

      const issuerPubkey: KeysetEndpoint = { jku: ISSUER_JKU, kid: ISSUER_KID };

      //
      // Step 1: Sign the user data
      //         using the issuer's private key
      //
      const token = await this.signUserData(
        ISSUER_PRIVKEY,
        dataObj,
        issuerPubkey
      );
      if (dataFiles.length === 1) return { "": token };

      dataToken[dataTags[index]] = token;
    }
    return dataToken;
  }
}
