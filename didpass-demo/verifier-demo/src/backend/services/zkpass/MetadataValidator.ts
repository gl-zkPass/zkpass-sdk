import { decode } from 'jsonwebtoken';
import {
  KeysetEndpointWrapped,
  PublicKey,
  ZkPassProofMetadataValidator,
  DataVerificationRequest,
  PublicKeyWrapped,
} from '@didpass/verifier-sdk';
import VerifierRepository from '../VerifierRepository';

export class MetadataValidator implements ZkPassProofMetadataValidator {
  private verifierRepository: VerifierRepository;

  public constructor(verifierRepository: VerifierRepository) {
    this.verifierRepository = verifierRepository;
  }

  async validate(
    dvrTitle: string,
    dvrId: string,
    dvrDigest: string,
    userDataVerifyingKey: PublicKey,
    dvrVerifyingKey: PublicKey,
    zkpassProofTtl: number
  ): Promise<void> {
    const cache = this.verifierRepository.getSignedDvrFromCache(dvrId);
    if (!cache) {
      throw new Error('DVR not found');
    }

    const decodedDvr = (decode(cache?.signedDvr) as any).data;
    const dvr = new DataVerificationRequest(
      decodedDvr.dvr_title,
      decodedDvr.dvr_id,
      decodedDvr.query_engine_ver,
      decodedDvr.query_method_ver,
      decodedDvr.query,
      decodedDvr.user_data_url,
      decodedDvr.user_data_verifying_key
    );

    if (dvr.dvrTitle !== dvrTitle) {
      throw new Error('DVR title mismatch');
    }

    this.validateKey(dvr.userDataVerifyingKey, userDataVerifyingKey);

    const verifyingKeyJKWS = {
      KeysetEndpoint: {
        jku: process.env.KEYSET_ENDPOINT_JKU_VERIFIER || '',
        kid: process.env.KEYSET_ENDPOINT_KID_VERIFIER || '',
      },
    };
    this.validateKey(verifyingKeyJKWS, dvrVerifyingKey);
    // this.validateDigest(dvrDigest, dvr);

    if (zkpassProofTtl > 0) {
      const currentTimestampInSeconds = Math.floor(new Date().getTime() / 1000);
      const diff = currentTimestampInSeconds - zkpassProofTtl;
      if (diff > 600) {
        throw new Error('Proof expired');
      }
    }
  }

  private isPublicKeyWrapped(
    dvrKeysetEndpoint: PublicKeyWrapped | KeysetEndpointWrapped
  ): dvrKeysetEndpoint is PublicKeyWrapped {
    return (dvrKeysetEndpoint as PublicKeyWrapped).PublicKey !== undefined;
  }

  private async validateKey(
    dvrKeysetEndpoint: PublicKeyWrapped | KeysetEndpointWrapped,
    proofKey: PublicKey
  ) {
    try {
      let key: PublicKey;
      if (this.isPublicKeyWrapped(dvrKeysetEndpoint)) {
        key = dvrKeysetEndpoint.PublicKey;
      } else {
        const jku = dvrKeysetEndpoint.KeysetEndpoint.jku;
        const kid = dvrKeysetEndpoint.KeysetEndpoint.kid;
        const response = await fetch(jku);

        const keyset = await response.json();
        key = keyset.keys.find(
          (keyData: { kid: string }) => keyData.kid === kid
        );
      }

      if (key) {
        const { x, y } = key;
        const valid = x === proofKey.x && y === proofKey.y;
        if (!valid) {
          throw new Error('Key mismatch');
        }
      } else {
        throw new Error(`Key is not found.`);
      }
    } catch (error) {
      throw new Error('Error fetching data keyset.');
    }
  }

  private validateDigest(dvrDigest: string, dvr: DataVerificationRequest) {
    if (dvrDigest != dvr.digest()) {
      throw new Error('Digest mismatch');
    }
  }
}
