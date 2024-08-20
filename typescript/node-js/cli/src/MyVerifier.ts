/*
 * MyVerifier.ts
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
import {
  PublicKey,
  MetadataValidatorResult,
  PublicKeyWrapped,
  KeysetEndpointWrapped,
  VerifyZkPassProofResult,
  ZkPassProofMetadataValidator,
} from "@didpass/zkpass-client-ts";
import { dvrTable } from "./utils/dvrTable";
import { readFileSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import { DvrData, Verifier } from "./libs/Verifier";
import {
  EXPECTED_DVR_TTL,
  ISSUER_JKU,
  ISSUER_KID,
  VERIFIER_JKU,
  VERIFIER_KID,
  VERIFIER_PRIVKEY,
  ZKPASS_ZKVM,
} from "./utils/constants";
import { UserDataRequests } from "@didpass/zkpass-client-ts/lib/src/classes/userDataRequest";

class MyMetadataValidator implements ZkPassProofMetadataValidator {
  constructor() {}

  async validate(dvrId: string): Promise<MetadataValidatorResult> {
    // Modify this function to validate the metadata of the proof
    // In this example, we are validating that the DVR title matches the one we issued.
    const dvr = dvrTable.value.getDvr(dvrId);
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
      expectedTtl: EXPECTED_DVR_TTL,
      expectedVerifyingDvrKey,
    };

    return result;
  }
}

export class MyVerifier extends Verifier {
  constructor() {
    super();
  }

  async getDvrToken(dvrFile: string, dataTags: string[]): Promise<string> {
    const DVR_TITLE: string = "My DVR";
    const USER_DATA_URL: string = "https://hostname/api/user_data/";
    const ENCODING = "utf-8";

    const query = readFileSync(dvrFile, ENCODING);
    console.log(`query=${query}`);

    const issuerPubkey = { jku: ISSUER_JKU, kid: ISSUER_KID };
    const verifierPubkey = { jku: VERIFIER_JKU, kid: VERIFIER_KID };

    const queryObj = JSON.parse(query);
    const userDataRequests: UserDataRequests = {};
    dataTags.forEach((tag) => {
      userDataRequests[tag] = {
        user_data_url: USER_DATA_URL,
        user_data_verifying_key: {
          KeysetEndpoint: issuerPubkey,
        },
      };
    });

    const dvrData: DvrData = {
      dvr_title: DVR_TITLE,
      dvr_id: uuidv4(),
      query: JSON.stringify(queryObj),
      user_data_requests: userDataRequests,
      dvr_verifying_key: {
        KeysetEndpoint: verifierPubkey,
      },
      zkvm: ZKPASS_ZKVM,
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
    dvrTable.value.addDvr(dvr);

    return dvrToken;
  }

  async verifyZkPassProof(
    zkPassProofToken: string
  ): Promise<VerifyZkPassProofResult> {
    console.log("\n#### starting zkPass proof verification...");
    const start = Date.now();

    const proofMetadataValidator = new MyMetadataValidator();

    // Step 1: Instantiate the zkPassClient object.
    // In this example, we have instantiated the zkPassClient object in the constructor.

    // Step 2: Call zkPassClient.verifyZkPassProof to verify the proof.
    const proofResult = await this.zkPassClient.verifyZkPassProof(
      zkPassProofToken,
      proofMetadataValidator
    );

    const duration = Date.now() - start;
    console.log(`#### verification completed [time=${duration}ms]`);

    return proofResult;
  }
}
