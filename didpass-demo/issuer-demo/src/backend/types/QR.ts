export interface IConnectQR {
    id: string;
    thid: string;
    typ: string;
    type: string;
    from: string;
    body: {
        callbackUrl: string;
        reason: string;
        nonce: string;
    };
}

export type QR = {
    id: string;
    qrCode: IConnectQR;
};