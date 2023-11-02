import {
  ZkPassProofMetadataValidator,
  PublicKey,
  KeysetEndpointWrapped,
} from "zkpass-client-ts/types/common";
import { dvrLookup } from "../dvrs/dvrHelper";
import { DataVerificationRequest } from "zkpass-client-ts/types/dvr";

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
  validate(
    dvrTitle: string,
    dvrId: string,
    dvrDigest: string,
    userDataVerifyingKey: PublicKey,
    dvrVerifyingKey: PublicKey,
    zkpassProofTtl: number
  ): void {
    /**
     * This validate method will be called first inside verifyZkpassProof
     * you can modify the logic here to suit your needs
     */

    const dvr = dvrLookup.value.getDVR(dvrId);
    dvr?.user_data_verifying_key;
    console.log("=== MyValidator.validate ===");
    console.log({ dvr });
    if (!dvr) {
      throw new Error("DVR not found");
    }

    console.log("=== validating dvrTitle ===");
    console.log({ proof_title: dvrTitle, dvr_title: dvr.dvr_title });
    if (dvr.dvr_title !== dvrTitle) {
      throw new Error("DVR title mismatch");
    }

    console.log("=== validating verifier key ===");
    this.validateKey(
      dvr?.user_data_verifying_key as KeysetEndpointWrapped,
      dvrVerifyingKey
    );

    // Verifier knows which issuer's public key to use to verify the proof
    const verifyingKeyJKWS = {
      KeysetEndpoint: {
        jku: process.env.NEXT_PUBLIC_URL + "/issuer/jwks.json",
        kid: "yibXxdascCcvpCxxbVvRm1B0N2loYIB8wMyGJjr5P0A=",
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
