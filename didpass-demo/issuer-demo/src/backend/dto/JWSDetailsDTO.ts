import { DIDAccount } from "../implementation/DIDAccount";

/**
 * Represents a JSON Web Key Set (JWKS) endpoint.
 */
export interface JwksEndpoint {
  jku: string;
  kid: string;
}

/**
 * Payload containing user data.
 */
export interface UserDataPayload {
  [key: string]: any;
}

/**
 * JWS Payload interface
 */
export interface JwsPayload {
  id: string;
  issuer: string;
  receiverDID: string;
  type: string;
  userData: UserDataPayload;
}

/**
 * Payload for tokenization process.
 */
export interface TokenizePayload {
  issuer: DIDAccount;
  receiverDID: string;
  type: string;
  userData: UserDataPayload;
  message: string;
  signature: string;
}
