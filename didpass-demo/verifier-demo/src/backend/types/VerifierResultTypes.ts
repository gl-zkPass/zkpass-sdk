import { RequestMetaform } from "@didpass/verifier-sdk";

export interface AuthVerificationResult {
  id: string;
  qrCode: RequestMetaform;
  requestedAt: number;
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
