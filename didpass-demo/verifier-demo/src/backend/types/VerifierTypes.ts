import { VerifyField, VerifyOperator } from './credentials/type';
import { VerifyCase } from '../cases/useCase';

export interface VerifyCaseType {
  case: VerifyCase;
  field: VerifyField;
  operator?: VerifyOperator;
  value?: string | number;
}

export interface ZkPassQueryCriteria {
  credField: string;
  verifyOperator?: VerifyOperator;
  value?: string | number;
}

export interface DvrQueryCacheResponse {
  queryId: string;
  dvrId: string;
  dvrTitle: string;
}

export enum VerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  NOT_FOUND = "not found",
}