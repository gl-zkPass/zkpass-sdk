import { IIssuerDetail } from "./QRTypes";

/**
 * Interface for Connect QR object
 * @interface IConnectQR
 */
export interface IConnectQR {
  id: string;
  thid: string;
  typ: string;
  type: string;
  from: string;
  body: {
    callbackUrl: string;
    reason: string;
    nonce: string;
    issuer?: IIssuerDetail;
  };
}

export type QR = {
  id: string;
  qrCode: IConnectQR;
};
