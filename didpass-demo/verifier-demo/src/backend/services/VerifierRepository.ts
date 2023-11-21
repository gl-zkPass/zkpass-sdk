import { AuthVerificationResult } from "@backend/types/VerifierResultTypes";
import { storageLookup } from '@backend/storage/StorageLookup';
import { SignedDvrResponse } from '@didpass/verifier-sdk/lib/types/signedDvrResponse';

export default class VerifierRepository {
  private storageLookup;

  constructor() {
    this.storageLookup = storageLookup;
  }

  getCacheValue(id: string): any {
    return this.storageLookup.value.get(id);
  }

  cacheValue(id: string, value: any): void {
    this.storageLookup.value.set(id, value);
  }

  public getVerificationRequestFromCache(
    sessionId: string
    ): AuthVerificationResult | null {
    return  this.getCacheValue(sessionId);
  }

  public cacheVerificationRequest(
    authVerificationRequest: AuthVerificationResult
  ): void {
    const { id } = authVerificationRequest;
    this.cacheValue(id, authVerificationRequest);
  }

  public uncacheVerificationRequest(sessionId: string) {
    this.storageLookup.value.delete(sessionId);
  }

  public getSignedDvrFromCache(
    dvrId: string
  ): SignedDvrResponse | null {
    return  this.getCacheValue(dvrId);
  }

  public cacheSignedDvr(
    verifyRequest: SignedDvrResponse
  ): void {
    const { id } = verifyRequest;
    this.cacheValue(id, verifyRequest);
  }

  public uncacheSignedDvr(dvrId: string) {
    this.storageLookup.value.delete(dvrId);
  }


  public getZkpassProofVerificationOutput(
    sessionId: string
  ): boolean {
    return this.getCacheValue(`${sessionId}__proof`);
  };

  public cacheZkpassProofVerificationOutput(
    sessionId: string,
    result: boolean
  ): void {
    const cacheId = `${sessionId}__proof`;
    this.cacheValue(cacheId, result);
  }

  public uncacheZkpassProofVerificationOutput(sessionId: string) {
    this.storageLookup.value.delete(sessionId);
  }
}
