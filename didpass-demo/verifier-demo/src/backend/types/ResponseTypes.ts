import { VerificationStatus } from './VerifierTypes';

export interface CheckStatusResponse {
  status: number;
  statusType: VerificationStatus;
  message: string;
};

export interface ErrorResponse {
  message: string;
}

export interface VerifierResponse {
  status: number;
  statusText: string;
  data?: any;
}