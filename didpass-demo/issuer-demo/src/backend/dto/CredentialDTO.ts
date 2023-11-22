import { IWalletResponse } from "./WalletDTO";

/**
 * Interface for a credential QR code object.
 */
export interface ICredentialQR {
  id: string;
  thid: string;
  typ: string;
  type: string;
  from: string;
  to: string;
  body: {
    credentials: ICredentialBody[];
    callbackUrl: string;
    nonce: string;
  };
}

/**
 * Interface for the body of a credential.
 */
export interface ICredentialBody {
  id: string;
  description: string;
  preview?: IPreviewDataCredential;
}

/**
 * Interface for preview data of a credential.
 */
export interface IPreviewDataCredential {
  [key: string]: any;
}

/**
 * Represents the response object for a credential.
 * @template T - The type of data contained in the response.
 */
export interface ICredentialResponse extends IWalletResponse<any> {}

/**
 * Represents the response object for a list of credentials.
 * @template T - The type of the credentials array.
 */
export interface ICredentialListResponse
  extends IWalletResponse<{
    credentials: any[];
    total: number;
  }> {}

/**
 * Enum representing the status of a credential.
 */
export enum CREDENTIAL_STATUS {
  "VALID",
  "REVOKED",
  "REQUIRES UPDATE",
}
