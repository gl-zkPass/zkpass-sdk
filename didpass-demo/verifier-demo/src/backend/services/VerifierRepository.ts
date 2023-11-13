import { injectable, inject } from 'inversify';
import prisma from "../../lib/prisma";
import { verification } from '@prisma/client';
import type { ISessionStorage } from "../storage/ISessionStorage";
import { AuthVerificationResultWithTimeout, CreateDvrResultWithTimeout } from "@backend/types/VerifierResultTypes";
import { VerifyZkpassProofOutput } from "@didpass/verifier-sdk";

@injectable()
export default class VerifierRepository {
  private prisma;
  private sessionStorage: ISessionStorage;

  constructor(@inject("ISessionStorage") sessionStorage: ISessionStorage) {
    this.prisma = prisma;
    this.sessionStorage = sessionStorage;
  }

  public async cacheVerificationRequest(
    authRequestWithTimeout: AuthVerificationResultWithTimeout
  ): Promise<void> {
    const { id, expiredAt } = authRequestWithTimeout;
    await this.cacheValue(id, authRequestWithTimeout, expiredAt);
  }

  public async uncacheVerificationRequest(sessionId: string) {
    this.sessionStorage.delete(sessionId);
  }

  public async getVerificationRequestFromCache(
    sessionId: string
  ): Promise<AuthVerificationResultWithTimeout | null> {
    return await this.getCacheValue(sessionId);
  }

  async cacheValue(id: string, value: any, expiredAt?: number): Promise<void> {
    if (expiredAt) {
      await this.sessionStorage.setWithTimeout(id, value, expiredAt);
    } else {
      await this.sessionStorage.set(id, value);
    }
  }

  async getCacheValue(id: string): Promise<any> {
    return await this.sessionStorage.get(id);
  }

  public async cacheSignedDvr(
    authRequestWithTimeout: CreateDvrResultWithTimeout
  ): Promise<void> {
    const { id, expiredAt } = authRequestWithTimeout;
    await this.cacheValue(id, authRequestWithTimeout, expiredAt);
  }

  public async uncacheSignedDvr(sessionId: string) {
    this.sessionStorage.delete(sessionId);
  }

  public async getSignedDvrFromCache(
    dvrId: string
  ): Promise<CreateDvrResultWithTimeout | null> {
    return await this.getCacheValue(dvrId);
  }

  public async cacheZkpassProofOutput(
    sessionId: string,
    authRequestWithTimeout: VerifyZkpassProofOutput
  ): Promise<void> {
    const {
      proof: { dvr_title, dvr_id },
    } = authRequestWithTimeout;
    const cacheId = `${sessionId}-VP`;
    await this.cacheValue(cacheId, { dvr_title, dvr_id });
  }

  public async uncacheZkpassProofOutput(dvrId: string) {
    this.sessionStorage.delete(dvrId);
  }

  public async getZkpassProofOutputFromCache(
    dvrId: string
  ): Promise<VerifyZkpassProofOutput | null> {
    return await this.getCacheValue(dvrId);
  }

  public async addZkpassProofToDB(
    sessionId: string,
    dvr_id: string,
    dvr_title: string,
    time_stamp: number,
    result: boolean,
    wallet: string = "abc"
  ) {
    await this.prisma.verification.create({
      data: {
        id: sessionId,
        dvr_id,
        dvr_title,
        time_stamp,
        wallet,
        status: result,
      },
    });
  }

  public async getZkpassProofFromDB(
    sessionId: string
  ): Promise<verification | null> {
    const verification = await this.prisma.verification.findFirst({
      where: {
        id: {
          equals: sessionId,
        },
      },
    });

    return verification;
  }
}
