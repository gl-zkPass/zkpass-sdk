/*
 * MyIssuer.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import fs from "fs";
import { Issuer } from "./libs/Issuer";
import { ISSUER_JKU, ISSUER_KID, ISSUER_PRIVKEY } from "./utils/constants";
import { UserDataTag } from "./utils/helper";
import { PublicKeyOrKeysetEndpoint } from "@zkpass/dvr-client-ts";

export class MyIssuer extends Issuer {
  public getUserDataToken(
    dataFiles: string[],
    dataTags: string[]
  ): UserDataTag {
    const dataToken: UserDataTag = {};
    for (let index = 0; index < dataFiles.length; index++) {
      const dataFile = dataFiles[index];

      const ENCODING = "utf-8";
      const data: string = fs.readFileSync(dataFile, ENCODING);
      console.log(`data ${dataTags[index]}=${data}`);

      const dataObj: any = JSON.parse(data);

      const issuerPubkey: PublicKeyOrKeysetEndpoint = {
        jku: ISSUER_JKU,
        kid: ISSUER_KID,
      };

      //
      // Sign the user data
      // using the issuer's private key
      //
      const token = this.signUserData(ISSUER_PRIVKEY, dataObj, issuerPubkey);
      if (dataFiles.length === 1) return { "": token };

      dataToken[dataTags[index]] = token;
    }
    return dataToken;
  }
}
