import { injectable, inject } from 'inversify';
import prisma from "../../lib/prisma";
import { verification } from '@prisma/client';
import { AuthVerificationResult, CreateDvrResult } from "@backend/types/VerifierResultTypes";
import { VerifyZkpassProofOutput } from "@didpass/verifier-sdk";
import { storageLookup } from '@backend/storage/StorageLookup';

@injectable()
export default class VerifierRepository {
  private prisma;
  private storageLookup;

  constructor() {
    this.prisma = prisma;
    this.storageLookup = storageLookup;
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
  
  public getVerificationRequestFromCache(
    sessionId: string
    ): AuthVerificationResult | null {
    return  this.getCacheValue(sessionId);
  }

  cacheValue(id: string, value: any): void {
    this.storageLookup.value.set(id, value);
  }
  
  getCacheValue(id: string): any {
    return this.storageLookup.value.get(id);
  }

  public cacheSignedDvr(
    authRequestWithTimeout: CreateDvrResult
  ): void {
    const { id } = authRequestWithTimeout;
    this.cacheValue(id, authRequestWithTimeout);
  }

  public uncacheSignedDvr(sessionId: string) {
    this.storageLookup.value.delete(sessionId);
  }

  public getSignedDvrFromCache(
    dvrId: string
  ): CreateDvrResult | null {
    return  this.getCacheValue(dvrId);
  }

  public cacheZkpassProofOutput(
    sessionId: string,
    authRequestWithTimeout: VerifyZkpassProofOutput
  ): void {
    const {
      proof: { dvr_title, dvr_id },
    } = authRequestWithTimeout;
    const cacheId = `${sessionId}-VP`;
    this.cacheValue(cacheId, { dvr_title, dvr_id });
  }

  public uncacheZkpassProofOutput(dvrId: string) {
    this.storageLookup.value.delete(dvrId);
  }

  public getZkpassProofOutputFromCache(
    dvrId: string
  ): VerifyZkpassProofOutput | null {
    return  this.getCacheValue(dvrId);
  }

  public addZkpassProofToDB(
    sessionId: string,
    dvr_id: string,
    dvr_title: string,
    time_stamp: number,
    result: boolean,
    wallet: string = "abc"
  ) {
    this.cacheValue(sessionId, {
      id: `${sessionId}__proof`,
      dvr_id,
      dvr_title,
      time_stamp,
      wallet,
      status: result,
    });
  }

  public getZkpassProofFromDB(
    sessionId: string
  ): verification | null {
    const zkPassProof = this.getCacheValue(`${sessionId}__proof`);

    return zkPassProof;
  }
}
