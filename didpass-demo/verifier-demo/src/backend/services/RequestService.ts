import { injectable, inject } from 'inversify';
import { SIWEDTO } from '@didpass/verifier-sdk';
import { VerifierService } from './VerifierService';
import { CreateSignedDvrParams, RequestVerifyParams } from '@backend/types/VerifierParamTypes';
import { AuthVerificationResultWithTimeout, CreateDvrResult, CreateDvrResultWithTimeout } from '@backend/types/VerifierResultTypes';
import { CheckStatusResponse } from '@backend/types/ResponseTypes';

@injectable()
export class RequestService {
  private verifier;

  public constructor(
    @inject('VerifierService') verifier: VerifierService
  ){
    this.verifier = verifier;
  };

  /**
   * Handle first verification request
   * 
   * @param queryId 
   * 
   * @returns {Promise<AuthVerificationResultWithTimeout>}
   */
  public async requestVerification(
    queryId: string
  ): Promise<AuthVerificationResultWithTimeout | string> {
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
   * @returns {Promise<CreateDvrResultWithTimeout>}
   */
  public async retrieveSignedDvr(
    sessionId: string,
    siweDto: SIWEDTO
  ): Promise<CreateDvrResultWithTimeout> {
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

  public async verifyProof(

  ){

  };
};