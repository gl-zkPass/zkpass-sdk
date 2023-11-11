import { injectable, inject } from 'inversify';
import { VerifyZkpassProofOutput } from '@didpass/verifier-sdk';
import type { ZkPassProofMetadataValidator } from '@didpass/verifier-sdk';

import VerifierRepository from './VerifierRepository';
import { VerifierInstance } from './sdk/VerifierInstance';
import { WalletCallbackParams } from '@backend/types/ProofVerifierTypes';

@injectable()
export class ProofVerifierService {
  private verifier;
  private verifierRepository;
  private validator;

  constructor(
    @inject('VerifierRepository') verifierRepository: VerifierRepository,
    @inject('VerifierInstance') verifierInstance: VerifierInstance,
    @inject("ZkPassProofMetadataValidator") validator: ZkPassProofMetadataValidator
  ){
    this.verifier = verifierInstance.getInstance();
    this.verifierRepository = verifierRepository;
    this.validator = validator;
  };
  
  /**
   * Verify proof through the verifier SDK
   * 
   * @param params 
   * 
   * @returns {Promise<VerifyZkpassProofOutput | string>} 
   */
  async verifyProof(
    params: WalletCallbackParams
  ): Promise<VerifyZkpassProofOutput | string> {
    return new Promise(async (resolve, reject) => {
      try {
        const { sessionId, zkpassProofToken } = params;

        const verifyZkpassProofOutput =
          await this.verifier.verifyProof(zkpassProofToken, this.validator);

        // If verification successful, add to cache
        if (verifyZkpassProofOutput.result) {
          await this.verifierRepository.cacheZkpassProofOutput(
            sessionId,
            verifyZkpassProofOutput
          );
        }

        const {
          proof: { dvr_id, dvr_title, time_stamp },
          result,
        } = verifyZkpassProofOutput;

        // Add to database
        this.verifierRepository.addZkpassProofToDB(
          sessionId,
          dvr_id,
          dvr_title,
          time_stamp,
          result
        );

        // Delete previous cache from redis
        await this.verifierRepository.uncacheSignedDvr(sessionId);

        resolve(verifyZkpassProofOutput);
      } catch (err) {
        reject(err);
      }
    });
  };
};