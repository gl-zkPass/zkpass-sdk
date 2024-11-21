/*
 * MyVerifier.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { dvrTable } from "./utils/dvrTable";
import { readFileSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import { Verifier } from "./libs/Verifier";
import {
  EXPECTED_DVR_TTL,
  ISSUER_JKU,
  ISSUER_KID,
  VERIFIER_JKU,
  VERIFIER_KID,
  VERIFIER_PRIVKEY,
  ZKPASS_ZKVM,
} from "./utils/constants";
import {
  UserDataRequest,
  DvrData as DvrDataNew,
  DvrDataPayload,
  ExpectedDvrMetadata,
  VerifyZkPassProofResult,
} from "@zkpass/dvr-client-ts";

export class MyVerifier extends Verifier {
  constructor(readonly dvr_id = uuidv4()) {
    super();
  }

  /**
   * Create a DVR token for the proof verification.
   * @param dvrFile - The path to the DVR file.
   * @param dataTags - An array of data tags.
   * @returns The DVR token.
   */
  getDvrToken(dvrFile: string, dataTags: string[]): string {
    const DVR_TITLE: string = "My DVR";
    const ENCODING = "utf-8";

    const query = readFileSync(dvrFile, ENCODING);
    console.log(`query=${query}`);

    const issuerPubkey = { jku: ISSUER_JKU, kid: ISSUER_KID };
    const verifierPubkey = { jku: VERIFIER_JKU, kid: VERIFIER_KID };

    const queryObj = JSON.parse(query);

    let userDataRequests: UserDataRequest[] = [];
    if (dataTags.length === 1) {
      userDataRequests = [{ key: "", value: issuerPubkey }];
    } else {
      dataTags.forEach((tag) => {
        userDataRequests.push({ key: tag, value: issuerPubkey });
      });
    }

    const dvrDataNew: DvrDataNew = {
      zkvm: ZKPASS_ZKVM,
      dvr_title: DVR_TITLE,
      dvr_id: this.dvr_id,
      query: JSON.stringify(queryObj),
      user_data_requests: userDataRequests,
      dvr_verifying_key: verifierPubkey,
    };

    //
    // Create a DVR token using the provided data
    // the DVR token is signed using the verifier's private key
    //
    const dvrToken = this.createDvr(VERIFIER_PRIVKEY, dvrDataNew);

    // Save the dvr to a global hash table
    // This will be needed by the validator to check the proof metadata
    const dvr = this.getDvr();
    dvrTable.value.addDvr(dvr);

    return dvrToken;
  }

  /**
   * Create expected metadata for the proof verification.
   * @param dvr - The DVR data payload.
   * @returns The expected metadata.
   */
  private createExpectedMetadata(dvr: DvrDataPayload): ExpectedDvrMetadata {
    const userDataVerifyingKeys = this.createUserDataVerifyingKeys(dvr);

    return {
      dvr: JSON.stringify(dvr),
      ttl: EXPECTED_DVR_TTL,
      user_data_verifying_keys: userDataVerifyingKeys,
    };
  }

  /**
   * Create user data verifying keys for the proof verification.
   * @param dvr - The DVR data payload.
   * @returns An array of user data verifying keys.
   */
  private createUserDataVerifyingKeys(dvr: DvrDataPayload) {
    const issuerPubkey = { jku: ISSUER_JKU, kid: ISSUER_KID };

    return Object.keys(dvr.user_data_requests).map((key) => ({
      key: key,
      value: issuerPubkey,
    }));
  }

  /**
   * Verify the zkPass proof.
   * @param zkPassProofToken - The zkPass proof token.
   * @returns The proof verification result.
   */
  verifyZkPassProof(zkPassProofToken: string): VerifyZkPassProofResult {
    console.log("\n#### starting zkPass proof verification...");
    const start = Date.now();

    // Step 1: Instantiate the zkPassClient object.
    // In this example, we have instantiated the zkPassClient object in the constructor.

    // Step 2: Create the expected metadata
    const dvr = dvrTable.value.getDvr(this.dvr_id);
    const expectedMetadata = this.createExpectedMetadata(dvr);

    // Step 3: Call zkPassClient.verifyZkPassProof to verify the proof.
    const proofResult = this.dvrModuleClient.callDvrVerifyZkPassProof(
      ZKPASS_ZKVM,
      zkPassProofToken,
      expectedMetadata
    );

    const duration = Date.now() - start;
    console.log(`#### verification completed [time=${duration}ms]`);

    return proofResult;
  }
}
