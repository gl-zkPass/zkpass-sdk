import { Auth } from "./Auth";
import { v4 } from "uuid";
import { ZkPassClient } from "@didpass/zkpass-client-ts";
import {
  JwksEndpoint,
  JwsPayload,
  TokenizePayload,
} from "../dto/JWSDetailsDTO";

/**
 * Represents a JWS credential used for tokenizing data.
 */
export class JwsCredential {
  private auth: Auth;
  private issuerKeyPem: string;
  private verifyingKeyEndpoint: JwksEndpoint;

  /**
   * Creates an instance of JwsCredential.
   * @constructor
   * @param {string} keyPem - The PEM-encoded issuer private key.
   * @param {JwksEndpoint} verifyingKeyEndpoint - The endpoint to retrieve the verifying key.
   */
  constructor(keyPem: string, verifyingKeyEndpoint: JwksEndpoint) {
    this.auth = new Auth();
    this.issuerKeyPem = keyPem;
    this.verifyingKeyEndpoint = verifyingKeyEndpoint;
  }

  /**
   * Tokenizes the given payload and returns the resulting JWS token.
   * @param data - The payload to be tokenized.
   * @returns The resulting JWS token.
   * @throws An error if the signature is not valid.
   */
  public async tokenizeCredential(data: TokenizePayload) {
    const { issuer, receiverDID, type, userData, message, signature } = data;

    const isAuthenticated = await this.auth.authenticateSignature(
      message,
      signature
    );

    if (!isAuthenticated) {
      throw new Error("Signature is not valid");
    }

    const payload: JwsPayload = {
      id: v4(),
      issuer: issuer.did,
      receiverDID,
      type,
      userData,
    };

    const zkPassClient = new ZkPassClient();
    const tokenData = await zkPassClient.signDataToJwsToken(
      this.issuerKeyPem,
      payload,
      this.verifyingKeyEndpoint
    );

    return tokenData;
  }
}
