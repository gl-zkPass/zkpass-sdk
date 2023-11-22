import { resolvePrivateKey } from "./KeyUtils";

/**
 * EC secp256k1 JSON Web Key (JWK) type definition.
 */
export type ECsecp256k1JWK = {
  kty: string;
  crv: string;
  x: string;
  y: string;
  d: string;
};

/**
 * Represents a signer account with a private key, raw JWK, public key, and address.
 */
export class SignerAccount {
  /** The raw JWK of the private key. */
  readonly rawJwk: ECsecp256k1JWK;
  /** The public key of the private key. */
  readonly publicKey: string;
  /** The address of the private key. */
  readonly address: string;

  /**
   * Creates a new SignerAccount instance with the given private key.
   * @param privateKey The private key to use for signing.
   */
  constructor(privateKey: string) {
    const resolved = resolvePrivateKey(privateKey);
    this.rawJwk = resolved.jwk;
    this.publicKey = resolved.publicKey;
    this.address = resolved.address;
  }
}
