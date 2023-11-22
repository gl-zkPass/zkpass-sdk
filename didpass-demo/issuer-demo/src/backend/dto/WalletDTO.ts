import { QRTypes } from "../types";

/**
 * Interface for wallet response.
 * @template T - Type of data in the response.
 */
export interface IWalletResponse<T = undefined> {
  status: number;
  statusText: string;
  data?: T;
}

/**
 * Payload for connecting to a QR code.
 */
export interface IConnectQRPayload {
  sessionId: string;
  did: string;
  message: string;
  signature: string;
}

/**
 * Interface for the payload of a credential QR code.
 */
export interface ICredentialQRPayload {
  credentialId: string;
  did: string;
  qrType: QRTypes;
  message: string;
  signature: string;
}
