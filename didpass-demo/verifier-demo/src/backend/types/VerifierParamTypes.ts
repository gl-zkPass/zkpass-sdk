import { ZkpassQuery, SIWEDTO } from "@didpass/verifier-sdk";
import { ZkPassQueryCriteria } from './VerifierTypes';

export interface RequestVerifyParams {
  dvrId: string;
  dvrTitle: string;
  queryId: string;
  timeout?: number;
};

export interface CreateSignedDvrParams {
  dvrId: string;
  dvrTitle: string;
  fullQuery: ZkpassQuery;
  sessionId: string;
  siweDto: SIWEDTO;
  timeout?: number;
};

export interface GenerateZkpassQueryParams {
  schemaType: string;
  criterias: ZkPassQueryCriteria[];
};