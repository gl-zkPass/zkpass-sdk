/*
 * proofVerifier.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 27th 2023
 * -----
 * Last Modified: December 14th 2023, 9:07:20 am
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
import {
  DataVerificationRequest,
  ZkPassClient,
  PublicKey,
  MetadataValidatorResult,
  PublicKeyWrapped,
  KeysetEndpointWrapped,
  VerifyZkpassProofResult,
} from "@didpass/zkpass-client-ts";
import { ZkPassProofMetadataValidator } from "@didpass/zkpass-client-ts";
import { dvrTable } from "./utils/dvrTable";
import { readFileSync } from "fs";
import { v4 as uuidv4 } from "uuid";

class MyMetadataValidator implements ZkPassProofMetadataValidator {
  constructor(readonly dvrTTL: number) {}

  async validate(dvrId: string): Promise<MetadataValidatorResult> {
    // Modify this function to validate the metadata of the proof
    // In this example, we are validating that the DVR title matches the one we issued.
    const dvr = dvrTable.value.getDVR(dvrId);
    if (!dvr) {
      throw new Error("DVR not found");
    }

    // dvrVerifyingKey can either be PublicKey or KeysetEndpoint
    let expectedVerifyingDvrKey: PublicKey = (
      dvr.dvrVerifyingKey as PublicKeyWrapped
    ).PublicKey;
    if (!expectedVerifyingDvrKey) {
      const { jku, kid } = (dvr.dvrVerifyingKey as KeysetEndpointWrapped)
        .KeysetEndpoint;

      const verifyingKey: PublicKey | undefined = await fetch(jku)
        .then((res) => res.json())
        .then((json: { keys: (PublicKey & { kid: string })[] }) =>
          json.keys.find((k) => k.kid === kid)
        )
        .catch(() => undefined);

      if (!verifyingKey) {
        throw new Error("DVR verifying key not found");
      }

      expectedVerifyingDvrKey = verifyingKey;
    }

    const result: MetadataValidatorResult = {
      expectedDvr: dvr,
      expectedTtl: this.dvrTTL,
      expectedVerifyingDvrKey,
    };

    return result;
  }
}

export class Verifier {
  private zkPassClient: ZkPassClient;
  constructor(
    private VERIFIER_PRIVKEY: string,
    private ISSUER_KID: string,
    private ISSUER_JKU: string,
    private VERIFIER_KID: string,
    private VERIFIER_JKU: string,
    private DVR_TTL: number
  ) {
    this.zkPassClient = new ZkPassClient();
  }

  async getDvrToken(dvrFile: string): Promise<string> {
    const DVR_TITLE: string = "My DVR";
    const USER_DATA_URL: string = "https://hostname/api/user_data/";
    const ENCODING = "utf-8";

    const query = readFileSync(dvrFile, ENCODING);
    console.log(`query=${query}`);

    const issuerPubkey = { jku: this.ISSUER_JKU, kid: this.ISSUER_KID };
    const verifierPubkey = { jku: this.VERIFIER_JKU, kid: this.VERIFIER_KID };

    const queryObj = JSON.parse(query);

    // Step 1: Instantiate the ZkPassClient object.
    // In this example, we have instantiated the zkPassClient object in the constructor.

    // Step 2: Call zkPassClient.getQueryEngineVersionInfo.
    // The version info is needed for DVR object creation.
    const { queryEngineVersion, queryMethodVersion } =
      await this.zkPassClient.getQueryEngineVersionInfo();

    // Step 3: Create the DVR object.
    const dvr = DataVerificationRequest.fromJSON({
      dvr_title: DVR_TITLE,
      dvr_id: uuidv4(),
      query_engine_ver: queryEngineVersion,
      query_method_ver: queryMethodVersion,
      query: JSON.stringify(queryObj),
      user_data_url: USER_DATA_URL,
      user_data_verifying_key: {
        KeysetEndpoint: issuerPubkey,
      },
      dvr_verifying_key: {
        KeysetEndpoint: verifierPubkey,
      },
    });

    // Step 4: Call zkPassClient.signToJwsToken.
    // to digitally-sign the dvr data.
    const dvrToken = await dvr.signToJwsToken(
      this.VERIFIER_PRIVKEY,
      verifierPubkey
    );

    // Save the dvr to a global hash table
    // This will be needed by the validator to check the proof metadata
    dvrTable.value.addDVR(dvr);

    return dvrToken;
  }

  async verifyZkpassProof(
    zkpassProofToken: string
  ): Promise<VerifyZkpassProofResult> {
    console.log("\n#### starting zkpass proof verification...");
    const start = Date.now();

    const proofMetadataValidator = new MyMetadataValidator(this.DVR_TTL);

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
