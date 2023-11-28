/*
 * proofValidator.ts
 * 
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * Created at: November 2nd 2023
 * -----
 * Last Modified: November 28th 2023
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { ZkPassProofMetadataValidator } from "@didpass/zkpass-client-ts/lib/interfaces";
import { dvrLookup } from "../dvrs/dvrHelper";
import {
  DataVerificationRequest,
  KeysetEndpointWrapped,
  PublicKey,
} from "@didpass/zkpass-client-ts";

export class MyValidator implements ZkPassProofMetadataValidator {
  /**
   * Validate provided proof.
   *
   * @param   {string}      dvrTitle              DVR title in the proof
   * @param   {string}      dvrId                 DVR ID in the proof
   * @param   {string}      dvrDigest             SHA256 digest of the DVR in the proof
   * @param   {string}      userDataVerifyingKey  Public key used for signing user data in the proof (issuer public key)
   * @param   {string}      dvrVerifyingKey       Public key used for signing dvr in the proof (verifier public key)
   * @param   {string}      zkpassProofTtl        TTL of the proof in seconds
   */
  async validate(
    dvrTitle: string,
    dvrId: string,
    dvrDigest: string,
    userDataVerifyingKey: PublicKey,
    dvrVerifyingKey: PublicKey,
    zkpassProofTtl: number
  ): Promise<void> {
    /**
     * This validate method will be called first inside verifyZkpassProof
     * you can modify the logic here to suit your needs
     */
    const dvr = dvrLookup.value.getDVR(dvrId);
    console.log("=== MyValidator.validate ===");
    console.log({ dvr });
    if (!dvr) {
      throw new Error("DVR not found");
    }
    console.log("=== validating dvrTitle ===");
    console.log({ proof_title: dvrTitle, dvr_title: dvr.dvrTitle });
    if (dvr.dvrTitle !== dvrTitle) {
      throw new Error("DVR title mismatch");
    }
    console.log("=== validating verifier key ===");
    this.validateKey(
      dvr?.userDataVerifyingKey as KeysetEndpointWrapped,
      dvrVerifyingKey
    );
    // Verifier knows which issuer's public key to use to verify the proof
    const verifyingKeyJKWS = {
      KeysetEndpoint: {
        jku: "https://gdp-admin.github.io/zkpass-sdk/zkpass/sample-jwks/issuer-key.json",
        kid: "k-1",
      },
    };
    console.log("=== validating issuer key ===");
    this.validateKey(verifyingKeyJKWS, userDataVerifyingKey);
    this.validateDigest(dvrDigest, dvr);
    if (zkpassProofTtl > 0) {
      const currentTimestampInSeconds = Math.floor(new Date().getTime() / 1000);
      const diff = currentTimestampInSeconds - zkpassProofTtl;
      console.log({ diff, currentTimestampInSeconds, zkpassProofTtl });
      // 10 mins
      if (diff > 600) {
        throw new Error("Proof expired");
      }
    }
  }

  /**
   * Verify that the key used for signing the proof is the same as the key in the keyset
   *
   * @param dvrKeysetEndpoint
   * @param proofKey
   */
  private async validateKey(
    dvrKeysetEndpoint: KeysetEndpointWrapped,
    proofKey: PublicKey
  ) {
    try {
      const jku = dvrKeysetEndpoint.KeysetEndpoint.jku;
      const kid = dvrKeysetEndpoint.KeysetEndpoint.kid;
      const response = await fetch(jku);

      const keyset = await response.json();
      console.log({ keyset });

      const key = keyset.keys.find(
        (keyData: { kid: string }) => keyData.kid === kid
      );

      if (key) {
        const { x, y } = key;
        const valid = x === proofKey.x && y === proofKey.y;
        if (!valid) {
          throw new Error("Key mismatch");
        }
      } else {
        throw new Error(`Key with kid ${kid} not found.`);
      }
    } catch (error) {
      console.log("=== Error fetching data ===");
      console.log({ error });
      throw new Error("Error fetching data keyset.");
    }
  }

  private validateDigest(dvrDigest: string, dvr: DataVerificationRequest) {
    console.log("=== validating digest ===");
    if (dvrDigest != dvr.digest()) {
      throw new Error("Digest mismatch");
    }
  }
}
