import { SIWEDTO } from '@didpass/verifier-sdk';

export interface WalletCallbackParams {
  zkpassProofToken: string;
  sessionId: string;
  siweDto: SIWEDTO;
};