import { RequestMetaform } from "@didpass/verifier-sdk";

export interface AuthVerificationResult {
  id: string;
  qrCode: RequestMetaform;
  requestedAt: number;
}
