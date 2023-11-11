import { VerifyField, VerifyOperator } from './credentials/type';
import { VerifyCase } from '../mocks/useCase';

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

export interface ErrorResponse {
  message: string;
}

export interface VerifierMessage {
  status: number;
  statusText: string;
  data?: any;
}