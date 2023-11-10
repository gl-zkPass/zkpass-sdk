import { ErrorResponse } from "../types/Response";
import { inject, injectable } from "inversify";
import jwt from "jsonwebtoken";
import "reflect-metadata";
import { v4 as uuidv4 } from "uuid";
import { ISessionStorage } from "../storage/ISessionStorage";
import { Auth, DIDAccount, QRGenerator } from "@didpass/issuer-sdk";
import { IConnectQR } from "@didpass/issuer-sdk/lib/types/AuthDTO";
import { IIssuerDetail } from "@didpass/issuer-sdk/lib/types/QRTypes";
import { IConnectQRPayload } from "@didpass/issuer-sdk/lib/types/WalletDTO";

@injectable()
export class ConnectService {
    private sessionStorage: ISessionStorage;
    private auth: Auth;
    private qrGenerator: QRGenerator;

    private expiresTime = 1 * 24 * 60 * 60;
    private privateKey = process.env.ISSUER_PRIVATE_KEY || "";
    private baseUrl = process.env.NEXT_PUBLIC_URL || "";

    constructor(@inject("ISessionStorage") sessionStorage: ISessionStorage) {
        this.sessionStorage = sessionStorage;
        this.auth = new Auth();

        const didAccount = new DIDAccount(this.privateKey);
        this.qrGenerator = new QRGenerator(didAccount);
    }

    public async checkStatus(uuid: string): Promise<any | ErrorResponse> {
        const token = await this.sessionStorage.get(uuid);
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

            const validSession = await this.sessionStorage.get(`${sessionId}QR`);

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
                await this.sessionStorage.set(sessionId, result);
                await this.sessionStorage.delete(`${sessionId}QR`);
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

        await this.sessionStorage.set(sessionId, sessionId);
        const qrCode: IConnectQR = await this.qrGenerator.connectQR(
            `${baseUrl}/api/issuer/connect/callback`,
            sessionId,
            issuerDetail
        );

        await this.sessionStorage.set(`${sessionId}QR`, qrCode);

        return [sessionId, qrCode];
    }

    public disconnect(did: string) {
        this.sessionStorage.delete(did);
    }
}
