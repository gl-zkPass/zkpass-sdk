/*
 * Filename: /typescript/node-js/cli/src/proofVerifier.ts
 * Path: /typescript/node-js/cli
 * Created Date: Monday, November 27th 2023, 9:18:10 am
 * Author: Naufal Fakhri Muhammad
 *
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import {
  DataVerificationRequest,
  ZkPassClient,
  PublicKey,
} from "@didpass/zkpass-client-ts";
import { ZkPassProofMetadataValidator } from "@didpass/zkpass-client-ts/lib/interfaces";
import { dvrTable } from "./dvrTable";
import { readFileSync } from "fs";
import { v4 as uuidv4 } from "uuid";

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

export class ProofVerifier {
  private readonly VERIFIER_PRIVKEY: string = `-----BEGIN PRIVATE KEY-----
    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
    EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
    PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
    -----END PRIVATE KEY-----`;

  async getDvrToken(dvrFile: string): Promise<string> {
    const query = readFileSync(dvrFile, "utf-8");
    console.log(`query=${query}`);

    const kid = "k-1";
    const jku =
      "https://gdp-admin.github.io/zkpass-sdk/zkpass/sample-jwks/verifier-key.json";
    const verifierPubkey = { jku, kid };

    const queryObj = JSON.parse(query);

    // Step 1: Instantiate the ZkPassClient object.
    const zkPassClient = new ZkPassClient();

    // Step 2: Call zkPassClient.getQueryEngineVersionInfo.
    // The version info is needed for DVR object creation.
    const { queryEngineVersion, queryMethodVersion } =
      await zkPassClient.getQueryEngineVersionInfo();

    // Step 3: Create the DVR object.
    const dvr = DataVerificationRequest.fromJSON({
      dvr_title: "My DVR",
      dvr_id: uuidv4(),
      query_engine_ver: queryEngineVersion,
      query_method_ver: queryMethodVersion,
      query: JSON.stringify(queryObj),
      user_data_url: "https://hostname/api/user_data/",
      user_data_verifying_key: {
        KeysetEndpoint: verifierPubkey,
      },
    });

    // Step 4: Call zkPassClient.signToJwsToken.
    // to digitally-sign the dvr data.
    const dvrToken = dvr.signToJwsToken(this.VERIFIER_PRIVKEY, verifierPubkey);

    // Save the dvr to a global hash table
    // This will be needed by the validator to check the proof metadata
    dvrTable.value.addDVR(dvr);

    return dvrToken;
  }

  async verifyZkpassProof(zkpassProofToken: string): Promise<boolean> {
    console.log("\n#### starting zkpass proof verification...");
    const start = Date.now();

    const proofMetadataValidator = new MyMetadataValidator();

    // Step 1: Instantiate the zkpassClient object.
    const zkpassClient = new ZkPassClient();

    // Step 2: Call zkpassClient.verifyZkpassProof to verify the proof.
    const proofResult = await zkpassClient.verifyZkpassProof(
      zkpassProofToken,
      proofMetadataValidator
    );

    const duration = Date.now() - start;
    console.log(`#### verification completed [time=${duration}ms]`);

    return proofResult;
  }
}
