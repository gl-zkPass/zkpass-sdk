import { inject, injectable } from "inversify";
import type { ISessionStorage } from "../storage/ISessionStorage";
import { ICredentialDatabase } from "./dto/ICredentialDatabase";
import userDataMock from "../mocks/userDataMock.json"
import {  IIssuerScanResponse, IssuerScanStatus } from "./dto/IssuerScanStatus";
import { v4 as uuidv4 } from "uuid";
import {
    Credential,
    DIDAccount,
    QRGenerator,
    JwsCredential,
} from "@didpass/issuer-sdk";
import {
    ICredentialBody,
    ICredentialQR,
} from "@didpass/issuer-sdk/lib/types/CredentialDTO";
import { IssuanceDetails } from "@didpass/issuer-sdk/lib/types/IssuanceDetailsDTO";
import { ICredentialQRPayload } from "@didpass/issuer-sdk/lib/types/WalletDTO";
import { QRTypes } from "@didpass/issuer-sdk/lib/types/QRTypes";
import {
    JwksEndpoint,
    TokenizePayload,
} from "@didpass/issuer-sdk/lib/types/JWSDetailsDTO";
import { IIssue } from "./IIssue";
import { StatusCodes } from "http-status-codes";

export enum DidUtility {
    POLYGON,
}

export enum DidSource {
    POLYGON = "POLYGON",
}

@injectable()
export class IssuerService implements IIssue {
    private sessionStorage: ISessionStorage;
    private credential: Credential;
    private qrGenerator: QRGenerator;
    private didAccount: DIDAccount;

    SCAN_STATUS_KEY_SUFFIX = ":scan-status";
    MAX_PREVIEW_ELEMENT = 4;

    private issuerPrivateKey = process.env.ISSUER_PRIVATE_KEY ?? "";
    private baseUrl = process.env.NEXT_PUBLIC_URL || "";

    public constructor(
        @inject("ISessionStorage") sessionStorage: ISessionStorage,
    ) {
        this.sessionStorage = sessionStorage;

        this.didAccount = new DIDAccount(this.issuerPrivateKey);
        this.qrGenerator = new QRGenerator(this.didAccount);
        this.credential = new Credential();
    }

    public getCredentialQRCode(
        did: string,
        type: string
    ): Promise<{
        result: ICredentialQR;
    }> {
        return new Promise(async (resolve, reject) => {
            const detailCredential:ICredentialDatabase = {
                id: 1,
                user_did: did,
                credential_id: "63918bf3-fb19-4079-b93a-e92b43927212",
                credential_type: "KtpCred",
                user_data: JSON.stringify({
                    'credentialSubject': userDataMock
                }),
                signed_vc: "",
                jws_credential: "",
                is_revoked: false,
            };

            if (!detailCredential) {
                return reject("Credential not found");
            }

            let qrType: QRTypes;
            switch (type) {
                case "VC":
                    qrType = QRTypes.TYPE_CREDENTIAL_VC;
                    break;
                case "JWT":
                    qrType = QRTypes.TYPE_CREDENTIAL_JWT;
                    break;
                default:
                    return reject("QR Type not found");
            }

            const userData = JSON.parse(detailCredential.user_data);
            const previewData = userData.credentialSubject;

            let preview: Record<string, any> = {};

            for (const key in previewData) {
                if (Object.prototype.hasOwnProperty.call(previewData, key)) {
                    preview[key] = previewData[key];
                }

                if (Object.keys(preview).length > this.MAX_PREVIEW_ELEMENT) {
                    break;
                }
            }

            const credentials: ICredentialBody[] = [
                {
                    id: detailCredential.credential_id,
                    description: "didPass Credential",
                    preview,
                },
            ];

            const id = uuidv4();
            const callbackUrl = `${process.env.NEXT_PUBLIC_URL}/api/issuer/agent`;
            const qrCode: ICredentialQR = await this.qrGenerator.credentialQR(
                callbackUrl,
                did,
                credentials,
                id,
                qrType
            );

            if (qrCode.to == did) {
                await this.setCredentialScanStatus( qrCode.id, qrCode.to);
                return resolve({ result: qrCode });
            } else {
                return reject("Credential DID is not match with your DID");
            }
        });
    }

    async setCredentialScanStatus(
        
        qrcodeId: string,
        userDid: string
    ): Promise<void> {
        const cacheKey = `${userDid}${this.SCAN_STATUS_KEY_SUFFIX}`;
        const cachedQrStatus = await this.sessionStorage.get(cacheKey);

        if (!cachedQrStatus || cachedQrStatus !== qrcodeId) {
            await this.sessionStorage.set(cacheKey, qrcodeId);
            return;
        }
    }

    public async getClaimCredential(
        credentialPayload: ICredentialQRPayload
    ): Promise<any> {
        try {
            const { did, qrType } = credentialPayload;

            const cacheKey = `${did}${this.SCAN_STATUS_KEY_SUFFIX}`;
            const validSession = await this.sessionStorage.get(cacheKey);
            if (!validSession) {
                throw new Error("Invalid session");
            }

            let result;

            switch (qrType) {
                case QRTypes.TYPE_CREDENTIAL_VC:
                    result = await this.signedVC(credentialPayload);
                    break;
                case QRTypes.TYPE_CREDENTIAL_JWT:
                    result = await this.jwsCredential(credentialPayload);
                    break;
                default:
                    throw new Error("Invalid QR Type");
            }

            await this.sessionStorage.set(cacheKey, IssuerScanStatus.SCANNED);
            return { result };
        } catch (error) {
            console.log("Error claim credential: ", error);
            throw new Error("Error while getting credential");
        }
    }

    async signedVC(credentialPayload: ICredentialQRPayload) {
        try {
            const { did, message, signature } = credentialPayload;
            const credential = {
                id: 1,
                user_did: did,
                credential_id: "63918bf3-fb19-4079-b93a-e92b43927212",
                credential_type: "KtpCred",
                user_data: JSON.stringify({
                    'credentialSubject': userDataMock
                }), 
                signed_vc: "",
                jws_credential: "",
                is_revoked: false,
            }

            if (credential?.signed_vc) {
                return credential.signed_vc;
            }

            const credentialSubject = JSON.parse(
                credential?.user_data!
            ).credentialSubject;

            const type = credential?.credential_type!;
            const issuanceDetails: IssuanceDetails = {
                issuer: this.didAccount,
                metadata: {
                    id: `https://example.org/${uuidv4()}`,
                    credentialType: type,
                    receiverDID: did,
                },
                credentialSubject: credentialSubject,
            };
            const result = await this.credential.signCredential(
                issuanceDetails,
                message,
                signature
            );

            return JSON.stringify(result);
        } catch (error) {
            console.log("Error claim vc: ", error);
            throw new Error("Error while getting vc");
        }
    }

    async jwsCredential(credentialPayload: ICredentialQRPayload) {
        try {
            const { did, credentialId, message, signature } = credentialPayload;
            const credential = {
                id: 1,
                user_did: did,
                credential_id: "63918bf3-fb19-4079-b93a-e92b43927212",
                credential_type: "KtpCred",
                user_data: JSON.stringify({
                    'credentialSubject': userDataMock
                }),
                signed_vc: "",
                jws_credential: "",
                is_revoked: false,
            };

            if (credential?.jws_credential) {
                return credential.jws_credential;
            }

            const credentialSubject = JSON.parse(
                credential?.user_data!
            ).credentialSubject;

            const keyPem = process.env.KEY_PEM!;
            const verifyEndpoint: JwksEndpoint = {
                jku: process.env.JWKS_ENDPOINT!,
                kid: process.env.JWKS_KID!,
            };

            const payload: TokenizePayload = {
                issuer: this.didAccount,
                receiverDID: did,
                type: credential?.credential_type!,
                userData: credentialSubject,
                message,
                signature,
            };

            const jwsCredential = new JwsCredential(keyPem, verifyEndpoint);

            const result = await jwsCredential.tokenizeCredential(payload);

            return result;
        } catch (error) {
            console.log("Error claim vc: ", error);
            throw new Error("Error while getting vc");
        }
    }

    public async checkScanStatus(
        userDid: string,
        credentialId: string
    ): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const cacheKey = `${userDid}${this.SCAN_STATUS_KEY_SUFFIX}`;
                const scanStatus = await this.sessionStorage.get(cacheKey);

                let response: IIssuerScanResponse;

                if (!scanStatus) {
                    response = {
                        status: StatusCodes.BAD_REQUEST,
                        statusType: IssuerScanStatus.NOT_FOUND,
                        message: `Credential is not found`,
                    };
                    return resolve(response);
                }

                if (scanStatus === IssuerScanStatus.SCANNED) {
                    response = {
                        status: StatusCodes.OK,
                        statusType: IssuerScanStatus.SCANNED,
                        message: `Credential is scanned`,
                    };

                    await this.sessionStorage.delete(cacheKey);
                } else {
                    response = {
                        status: StatusCodes.OK,
                        statusType: IssuerScanStatus.PENDING,
                        message: `Credential is waiting to be scanned`,
                    };
                }

                return resolve(response);
            } catch (error) {
                console.log(error);
                return reject(error);
            }
        });
    }
}
