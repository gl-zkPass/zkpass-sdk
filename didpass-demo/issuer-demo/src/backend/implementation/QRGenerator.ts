import { QRTypes } from "../types/QRTypes";
import type { IIssuerDetail } from "../types/QRTypes";
import { DIDAccount } from "./DIDAccount";
import { v4 } from "uuid";
import { generateNonce } from "siwe";
import { IConnectQR } from "../types/QR";
import { ICredentialBody, ICredentialQR } from "../dto/CredentialDTO";

/**
 * QRGenerator class for generating QR codes for connecting, issuing, and verifying credentials.
 * @class
 * @property {string} issuerDid - The issuer's DID.
 * @property {DIDAccount} didAccount - The DID account.
 */
export class QRGenerator {
  readonly issuerDid: string;

  /**
   * Creates an instance of QRGenerator.
   * @param {DIDAccount} didAccount - The DID account to generate QR code for.
   */
  constructor(readonly didAccount: DIDAccount) {
    this.issuerDid = didAccount.did;
  }

  /**
   * Generates a Connect QR code object with the given callback endpoint, session ID, and optional issuer details.
   * @param callbackEndpoint The callback endpoint for the Connect QR code.
   * @param sessionId The session ID for the Connect QR code. Defaults to a randomly generated UUID v4.
   * @param issuerDetail Optional issuer details to include in the Connect QR code.
   * @returns The generated Connect QR code object.
   */
  connectQR(
    callbackEndpoint: string,
    sessionId: string = v4(),
    issuerDetail?: IIssuerDetail
  ): IConnectQR {
    const id = sessionId;
    const nonce = generateNonce();
    const qrCode: IConnectQR = {
      id,
      thid: id,
      from: this.issuerDid,
      typ: "application/json",
      type: QRTypes.TYPE_CONNECT,
      body: {
        reason: "Authentication Request",
        callbackUrl: callbackEndpoint,
        nonce,
      },
    };

    if (issuerDetail) {
      qrCode.body.issuer = issuerDetail;
    }

    return qrCode;
  }

  /**
   * Generates a credential QR code object.
   * @param callbackEndpoint - The callback endpoint URL.
   * @param userDid - The user's DID.
   * @param credentials - An array of credential bodies.
   * @param sessionId - (Optional) The session ID. Defaults to a generated UUID v4.
   * @param type - (Optional) The QR code type. Defaults to QRTypes.TYPE_CREDENTIAL_VC.
   * @returns The generated credential QR code object.
   */
  credentialQR(
    callbackEndpoint: string,
    userDid: string,
    credentials: ICredentialBody[],
    sessionId: string = v4(),
    type: QRTypes = QRTypes.TYPE_CREDENTIAL_VC
  ): ICredentialQR {
    const id = sessionId;
    const nonce = generateNonce();
    const qrCode: ICredentialQR = {
      id,
      thid: id,
      from: this.issuerDid,
      to: userDid,
      typ: "application/json",
      type,
      body: {
        credentials,
        callbackUrl: callbackEndpoint,
        nonce,
      },
    };

    return qrCode;
  }

  verifyCredentialQR() {}
}
