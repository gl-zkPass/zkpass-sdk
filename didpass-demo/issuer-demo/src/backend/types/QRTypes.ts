/**
 * Enum for QR types used in the issuer-sdk.
 */
export enum QRTypes {
  TYPE_CONNECT = "https://type.ssi.id/connect/1.0/request",
  TYPE_CREDENTIAL_VC = "https://type.ssi.id/credential/1.0/request/vc",
  TYPE_CREDENTIAL_JWT = "https://type.ssi.id/credential/1.0/request/jwt",
  TYPE_VERIFY = "https://type.ssi.id/verify/1.0/request",
}

/**
 * Interface for issuer details.
 */
export interface IIssuerDetail {
  fullName: string;
  shortName: string;
  restoreUrl: string;
  logo: string;
}
