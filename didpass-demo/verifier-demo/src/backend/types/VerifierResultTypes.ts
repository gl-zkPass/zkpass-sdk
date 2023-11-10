export interface CreateDvrQueryRequest {
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

export interface CreateDvrQueryRequestWithTimeout extends CreateDvrQueryRequest {
  expiredAt: number;
}