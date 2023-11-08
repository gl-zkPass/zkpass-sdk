import { QRTypes } from "@didpass/issuer-sdk/lib/types/QRTypes";
import {
    ICredentialQRPayload,
    IWalletResponse,
} from "@didpass/issuer-sdk/lib/types/WalletDTO";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method !== "POST") {
        return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
    }
    let response: IWalletResponse<{ result: string }>;

    try {
        const credentialPayload: ICredentialQRPayload = req.body;
        const {qrType} = credentialPayload;
        let result="";
        if(qrType === QRTypes.TYPE_CREDENTIAL_VC){
            result = JSON.stringify({
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://www.w3.org/2018/credentials/examples/v1",
                    {
                        "TempatLahir": "ex:TempatLahir",
                        "BerlakuHingga": "ex:BerlakuHingga",
                        "Kewarganegaraan": "ex:Kewarganegaraan",
                        "Alamat": "ex:Alamat",
                        "RTRW": "ex:RTRW",
                        "StatusPerkawinan": "ex:StatusPerkawinan",
                        "Agama": "ex:Agama",
                        "Kecamatan": "ex:Kecamatan",
                        "Provinsi": "ex:Provinsi",
                        "GolonganDarah": "ex:GolonganDarah",
                        "KotaKabupaten": "ex:KotaKabupaten",
                        "KelurahanDesa": "ex:KelurahanDesa",
                        "NIK": "ex:NIK",
                        "Pekerjaan": "ex:Pekerjaan",
                        "Nama": "ex:Nama",
                        "TanggalLahir": "ex:TanggalLahir"
                    }
                ],
                "id": "https://example.org/95bcea04-80ec-4ab4-8ad2-85ccdbaba257",
                "type": [
                    "VerifiableCredential",
                    "KtpCred"
                ],
                "credentialSubject": {
                    "TanggalLahir": 19900208,
                    "Kewarganegaraan": "WNI",
                    "Pekerjaan": "PEGAWAI SWASTA",
                    "NIK": 1808023348760001,
                    "GolonganDarah": "O",
                    "BerlakuHingga": "SEUMUR HIDUP",
                    "KotaKabupaten": "JAKARTA PUSAT",
                    "Nama": "JHON DOE",
                    "StatusPerkawinan": "BELUM KAWIN",
                    "Provinsi": "DKI JAKARTA",
                    "Alamat": "Jl. PETOJO VIJ.3 NO. 60",
                    "RTRW": "001/001",
                    "KelurahanDesa": "CIDENG",
                    "Agama": "ISLAM",
                    "Kecamatan": "GAMBIR",
                    "TempatLahir": "GROGOL"
                },
                "issuer": "did:pkh:eip155:1:0x5C48E2f42AC19176263DAfCCb10872D5cEa1d10A",
                "issuanceDate": "2023-11-08T10:38:51.224Z",
                "proof": {
                    "@context": [
                        "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld",
                        "https://demo.spruceid.com/EcdsaSecp256k1RecoverySignature2020/esrs2020-extra-0.0.jsonld"
                    ],
                    "type": "EcdsaSecp256k1RecoverySignature2020",
                    "proofPurpose": "assertionMethod",
                    "verificationMethod": "did:pkh:eip155:1:0x5C48E2f42AC19176263DAfCCb10872D5cEa1d10A#blockchainAccountId",
                    "created": "2023-11-08T10:38:51.230Z",
                    "jws": "eyJhbGciOiJFUzI1NkstUiIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..G4TFVnsSZECZXT7VqroFZdceGDRgSBn_nBf16dXdB49418E-EEsJWuY6eBX3KGXzGuNYUiwRw0vCDWnHR39lcwA"
                },
                "holder": "did:ethr:0xcb5c68698a367c396dB6fE3Dd70A2e31e7134118"
            });
        }else if(qrType === QRTypes.TYPE_CREDENTIAL_JWT){
            result = "eyJhbGciOiJFUzI1NiIsImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS96dWxhbWRhdC96dWxhbWRhdC5naXRodWIuaW8vc2FtcGxlLWtleS96a3Ata2V5L2lzc3Vlci1rZXkuanNvbiIsImtpZCI6ImstMSJ9.eyJkYXRhIjp7ImlkIjoiYWIxMmZlZWEtODdjMi00ZTc2LThlZGQtMmZjOTVmZGE1MDBjIiwiaXNzdWVyIjoiZGlkOnBraDplaXAxNTU6MToweDVDNDhFMmY0MkFDMTkxNzYyNjNEQWZDQ2IxMDg3MkQ1Y0VhMWQxMEEiLCJyZWNlaXZlckRJRCI6ImRpZDpldGhyOjB4Y2I1YzY4Njk4YTM2N2MzOTZkQjZmRTNEZDcwQTJlMzFlNzEzNDExOCIsInR5cGUiOiJLdHBDcmVkIiwidXNlckRhdGEiOnsiTklLIjoxODA4MDIzMzQ4NzYwMDAxLCJOYW1hIjoiSkhPTiBET0UiLCJCZXJsYWt1SGluZ2dhIjoiU0VVTVVSIEhJRFVQIiwiUGVrZXJqYWFuIjoiUEVHQVdBSSBTV0FTVEEiLCJTdGF0dXNQZXJrYXdpbmFuIjoiQkVMVU0gS0FXSU4iLCJHb2xvbmdhbkRhcmFoIjoiTyIsIkFnYW1hIjoiSVNMQU0iLCJUYW5nZ2FsTGFoaXIiOjE5OTAwMjA4LCJUZW1wYXRMYWhpciI6IkdST0dPTCIsIkFsYW1hdCI6IkpsLiBQRVRPSk8gVklKLjMgTk8uIDYwIiwiS2VjYW1hdGFuIjoiR0FNQklSIiwiS2VsdXJhaGFuRGVzYSI6IkNJREVORyIsIktld2FyZ2FuZWdhcmFhbiI6IldOSSIsIktvdGFLYWJ1cGF0ZW4iOiJKQUtBUlRBIFBVU0FUIiwiUHJvdmluc2kiOiJES0kgSkFLQVJUQSIsIlJUUlciOiIwMDEvMDAxIn19fQ.mVLMGHppLq43ebqu1maiE56uYwtRaUCKW8QT5gA3oNSVc1gYLIiw-TBgDuwicrWHI_xwXv7jHCSZcE8Csu2QZg";
        }

        response = {
            status: StatusCodes.OK,
            statusText: ReasonPhrases.OK,
            data: {
                "result": result
            },
        };
    } catch (error) {
        console.log(error);
        response = {
            status: StatusCodes.BAD_REQUEST,
            statusText: ReasonPhrases.BAD_REQUEST,
        };
    }

    return res.status(response.status).send(response);
}
