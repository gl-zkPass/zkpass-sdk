import jwt from "jsonwebtoken";
import "reflect-metadata";
import { v4 as uuidv4 } from "uuid";
import { lookupTable } from "./storage/LookupTable";
import checkEnvironmentVariables from "./utils/environment-check";
import { IConnectQRPayload } from "./dto";
import { ErrorResponse, IConnectQR, IIssuerDetail } from "./types";
import { Auth, DIDAccount, QRGenerator } from "./implementation";

export class ConnectService {
  private auth: Auth;
  private qrGenerator: QRGenerator;

  private expiresTime = 1 * 24 * 60 * 60;
  private privateKey = process.env.ISSUER_PRIVATE_KEY || "";
  private baseUrl = process.env.NEXT_PUBLIC_URL || "";

  constructor() {
    checkEnvironmentVariables();

    this.auth = new Auth();

    const didAccount = new DIDAccount(this.privateKey);
    this.qrGenerator = new QRGenerator(didAccount);
  }

  public async checkStatus(uuid: string): Promise<any | ErrorResponse> {
    const token = lookupTable.value.getValue(uuid);
    try {
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        return {
          message: "Token incorrect",
        };
      }
      const secret = process.env.SECRET_KEY || "secret";
      const jwtPayload = jwt.verify(token, secret);
      if (typeof jwtPayload === "string") return token;

      return {
        did: jwtPayload.did,
        expiredAt: jwtPayload.exp,
        token,
      };
    } catch (err) {
      console.log("Error Checking Status : ", err);
      return {
        message: "Error Checking Status",
      };
    }
  }

  async authorize(connectPayload: IConnectQRPayload): Promise<void> {
    try {
      const { sessionId, did, message, signature } = connectPayload;

      const validSession = lookupTable.value.getValue(`${sessionId}QR`);

      if (!validSession) {
        throw new Error("Session not found");
      }

      const result = await this.auth.authenticateSignature(message, signature);

      if (result) {
        const payload = {
          did: did,
        };
        const secret = process.env.SECRET_KEY || "secret";
        const result = jwt.sign(payload, secret, {
          expiresIn: this.expiresTime,
        });
        lookupTable.value.addValue(sessionId, result);
        lookupTable.value.deleteValue(`${sessionId}QR`);
      }
    } catch (error) {
      console.log("Error Auth : ", error);
      throw new Error("Error Authentication");
    }
  }

  public async getConnectQR() {
    const baseUrl = process.env.NEXT_PUBLIC_URL;
    const sessionId = uuidv4();
    const issuerDetail: IIssuerDetail = {
      fullName: "didPass demo issuer",
      shortName: "didPass",
      logo: `${this.baseUrl}/images/logo.png`,
      restoreUrl: `${this.baseUrl}/api/restore`,
    };

    lookupTable.value.addValue(sessionId, sessionId);
    const qrCode: IConnectQR = await this.qrGenerator.connectQR(
      `${baseUrl}/api/issuer/connect/callback`,
      sessionId,
      issuerDetail
    );

    lookupTable.value.addValue(`${sessionId}QR`, qrCode);

    return [sessionId, qrCode];
  }

  public disconnect() {
    lookupTable.value.clearTable();
  }
}
