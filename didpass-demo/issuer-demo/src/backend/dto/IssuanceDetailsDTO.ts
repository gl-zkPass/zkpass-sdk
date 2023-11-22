import { DIDAccount } from "../implementation";

/**
 * Represents the details of a credential issuance.
 */
export interface IssuanceDetails {
  issuer: DIDAccount;
  metadata: Metadata;
  credentialSubject: object;
}

/**
 * Metadata for a credential issuance.
 */
interface Metadata {
  id: string;
  context?: any | any[];
  credentialType: string | string[];
  receiverDID: string;
  validFrom?: Date;
  validUntil?: Date;
}
