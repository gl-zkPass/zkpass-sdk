import { RequestMetaform } from "@didpass/verifier-sdk";

export interface AuthVerificationResult {
  id: string;
  qrCode: RequestMetaform;
  requestedAt: number;
}

export interface AuthVerificationResultWithTimeout extends AuthVerificationResult {
  expiredAt: number;
}

export interface CreateDvrResult {
  id: string;
  thid: string;
  from: string;
  typ: string;
  type: string;
  body: {
      reason?: string;
      message?: string;
      callbackUrl: string;
      signedDvr: string
  };
  requestedAt: number;
}

export interface CreateDvrResultWithTimeout extends CreateDvrResult {
  expiredAt: number;
}

