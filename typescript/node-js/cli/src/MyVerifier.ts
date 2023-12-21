/*
 * MyVerifier.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: December 21st 2023
 * -----
 * Last Modified: December 21st 2023
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
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
import { PublicKey } from "@didpass/zkpass-client-ts";
import { ZkPassProofMetadataValidator } from "@didpass/zkpass-client-ts/lib/interfaces";
import { dvrTable } from "./utils/dvrTable";
import { readFileSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import { DvrData, Verifier } from "./libs/Verifier";
import {
  VERIFIER_JKU,
  VERIFIER_KID,
  VERIFIER_PRIVKEY,
} from "./utils/constants";

class MyMetadataValidator implements ZkPassProofMetadataValidator {
  async validate(
    dvrTitle: string,
    dvrId: string,
    dvrDigest: string,
    userDataVerifyingKey: PublicKey,
    dvrVerifyingKey: PublicKey,
    zkpassProofTtl: number
  ): Promise<void> {
    // Modify this function to validate the metadata of the proof
    // In this example, we are validating that the DVR title matches the one we issued.
    const dvr = dvrTable.value.getDVR(dvrId);
    if (!dvr) {
      throw new Error("DVR not found");
    }
    if (dvr.dvrTitle !== dvrTitle) {
      throw new Error("DVR title mismatch");
    }
    // In this example, we are validating that the DVR digest matches the one we issued.
    if (dvrDigest != dvr.digest()) {
      throw new Error("Digest mismatch");
    }
  }
}

export class MyVerifier extends Verifier {
  constructor() {
    super();
  }

  async getDvrToken(dvrFile: string): Promise<string> {
    const DVR_TITLE: string = "My DVR";
    const USER_DATA_URL: string = "https://hostname/api/user_data/";
    const ENCODING = "utf-8";

    const query = readFileSync(dvrFile, ENCODING);
    console.log(`query=${query}`);

    const verifierPubkey = { jku: VERIFIER_JKU, kid: VERIFIER_KID };

    const queryObj = JSON.parse(query);

    const dvrData: DvrData = {
      dvr_title: DVR_TITLE,
      dvr_id: uuidv4(),
      query: JSON.stringify(queryObj),
      user_data_url: USER_DATA_URL,
      user_data_verifying_key: {
        KeysetEndpoint: verifierPubkey,
      },
    };

    //
    // Step 1: Create a DVR token using the provided data
    //         the DVR token is signed using the verifier's private key
    //
    const dvrToken = await this.createDvr(
      VERIFIER_PRIVKEY,
      dvrData,
      verifierPubkey
    );

    // Save the dvr to a global hash table
    // This will be needed by the validator to check the proof metadata
    const dvr = this.getDvr();
    dvrTable.value.addDVR(dvr);

    return dvrToken;
  }

  async verifyZkpassProof(zkpassProofToken: string): Promise<boolean> {
    console.log("\n#### starting zkpass proof verification...");
    const start = Date.now();

    const proofMetadataValidator = new MyMetadataValidator();

    // Step 1: Instantiate the zkPassClient object.
    // In this example, we have instantiated the zkPassClient object in the constructor.

    // Step 2: Call zkPassClient.verifyZkpassProof to verify the proof.
    const proofResult = await this.zkPassClient.verifyZkpassProof(
      zkpassProofToken,
      proofMetadataValidator
    );

    const duration = Date.now() - start;
    console.log(`#### verification completed [time=${duration}ms]`);

    return proofResult;
  }
}
