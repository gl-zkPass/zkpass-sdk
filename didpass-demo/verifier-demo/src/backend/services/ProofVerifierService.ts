import { injectable, inject } from 'inversify';
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
   * @returns {Promise<boolean>} 
   */
  async verifyProof(
    params: WalletCallbackParams
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const { sessionId, zkpassProofToken } = params;

        const verifyZkpassProofOutput =
          await this.verifier.verifyProof(zkpassProofToken, this.validator);
        
          // If verification successful, add to cache
        if (verifyZkpassProofOutput) {
          this.verifierRepository.cacheZkpassProofVerificationOutput(
            sessionId,
            verifyZkpassProofOutput
          );
        }

        // Delete previous cache
        this.verifierRepository.uncacheVerificationRequest(sessionId);

        resolve(verifyZkpassProofOutput);
      } catch (err) {
        reject(err);
      }
    });
  };
};