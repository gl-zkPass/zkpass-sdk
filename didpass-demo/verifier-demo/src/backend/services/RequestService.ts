import { injectable, inject } from 'inversify';
import { SIWEDTO } from '@didpass/verifier-sdk';
import { SignedDvrResponse } from '@didpass/verifier-sdk/lib/types/signedDvrResponse';

import { VerifierService } from './VerifierService';
import { ProofVerifierService } from './ProofVerifierService';
import { CreateSignedDvrParams, RequestVerifyParams } from '@backend/types/VerifierParamTypes';
import { CheckStatusResponse } from '@backend/types/ResponseTypes';
import { WalletCallbackParams } from '@backend/types/ProofVerifierTypes';
import { AuthVerificationResult } from '@backend/types/VerifierResultTypes';

@injectable()
export class RequestService {
  private verifier;
  private proofVerifier;

  public constructor(
    @inject('VerifierService') verifier: VerifierService,
    @inject('ProofVerifierService') proofVerifier: ProofVerifierService
  ){
    this.verifier = verifier;
    this.proofVerifier = proofVerifier;
  };

  /**
   * Handle first verification request
   * 
   * @param queryId 
   * 
   * @returns {Promise<AuthVerificationResult>}
   */
  public async requestVerification(
    queryId: string
  ): Promise<AuthVerificationResult | string> {
    if (!queryId && parseInt(queryId) != 0) {
      throw "Bad Request, empty query_id";
    }

    const dvrIdTitle = await this.verifier.getDvrIdTitle(queryId);
    const params: RequestVerifyParams = { ...dvrIdTitle };
    const result = await this.verifier.requestVerification(params);
  
    return result;
  };

  /**
   * Handle retrieveing signed DVR after QR scanned
   * 
   * @param sessionId 
   * @param siweDto 
   * 
   * @returns {Promise<SignedDvrResponse>}
   */
  public async retrieveSignedDvr(
    sessionId: string,
    siweDto: SIWEDTO
  ): Promise<SignedDvrResponse> {
    // Verify SIWE signature
    this.verifier.verifySiwe(siweDto);

    // Retrieve previously cached DVR
    const cachedDvrData = await this.verifier.getDvrFromCache(sessionId);
    if (!cachedDvrData) {
      throw "DVR not found";
    }

    const { queryId, dvrId, dvrTitle } = cachedDvrData;
    const fullQuery = await this.verifier.constructFullQuery(queryId);
    
    const params: CreateSignedDvrParams = {
      dvrId,
      dvrTitle,
      fullQuery,
      sessionId,
      siweDto,
    };
    const signedDvr = await this.verifier.createSignedDvr(params);

    return signedDvr;
  };

  /**
   * Handle checking verification status
   * 
   * @param sessionId 
   * 
   * @returns {Promise<CheckStatusResponse>}
   */
  public async checkStatus(
    sessionId: string
  ): Promise<CheckStatusResponse> {
    const result = await this.verifier.checkStatus(sessionId);

    return result;
  };

  /**
   * Handle verifying proof
   * 
   * @param params
   * 
   * @returns {Promise<VerifyZkpassProofOutput | string>} 
   */
  public async verifyProof(
    params: WalletCallbackParams
  ): Promise<boolean>{
    // Verfiy SIWE signature
    const { siweDto } = params;
    this.verifier.verifySiwe(siweDto);

    const result = await this.proofVerifier.verifyProof(params);

    return result;
  };
};