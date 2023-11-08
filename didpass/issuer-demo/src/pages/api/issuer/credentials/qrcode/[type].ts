

import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    try {
        const { type } = req.query;
        if (!type) {
            res
                .status(StatusCodes.BAD_REQUEST)
                .send({ message: ReasonPhrases.BAD_REQUEST + ", empty credential Id" });
        }
        type === 'VC' ?
            res.status(StatusCodes.OK).json({
                "result": {
                    "id": "56ab6471-6134-4b52-aebb-35d4281ac426",
                    "thid": "56ab6471-6134-4b52-aebb-35d4281ac426",
                    "from": "did:pkh:eip155:1:0x5C48E2f42AC19176263DAfCCb10872D5cEa1d10A",
                    "to": "did:ethr:0xcb5c68698a367c396dB6fE3Dd70A2e31e7134118",
                    "typ": "application/json",
                    "type": "https://type.ssi.id/credential/1.0/request/vc",
                    "body": {
                        "credentials": [
                            {
                                "id": "63918bf3-fb19-4079-b93a-e92b43927212",
                                "description": "didPass Credential",
                                "preview": {
                                    "NIK": 1808023348760001,
                                    "Nama": "JHON DOE",
                                    "BerlakuHingga": "SEUMUR HIDUP",
                                    "Pekerjaan": "PEGAWAI SWASTA",
                                    "StatusPerkawinan": "BELUM KAWIN"
                                }
                            }
                        ],
                        "callbackUrl": "https://ca5f-103-29-150-88.ngrok-free.app/api/issuer/agent",
                        "nonce": "ynY7X11zBwdxIsbat"
                    }
                }
            }) :
            type === 'JWT' ?
                res.status(StatusCodes.OK).json({
                    "result": {
                        "id": "258a0095-ecdf-4e41-86f3-d16c3ee71a19",
                        "thid": "258a0095-ecdf-4e41-86f3-d16c3ee71a19",
                        "from": "did:pkh:eip155:1:0x5C48E2f42AC19176263DAfCCb10872D5cEa1d10A",
                        "to": "did:ethr:0xcb5c68698a367c396dB6fE3Dd70A2e31e7134118",
                        "typ": "application/json",
                        "type": "https://type.ssi.id/credential/1.0/request/jwt",
                        "body": {
                            "credentials": [
                                {
                                    "id": "63918bf3-fb19-4079-b93a-e92b43927212",
                                    "description": "didPass Credential",
                                    "preview": {
                                        "NIK": 1808023348760001,
                                        "Nama": "JHON DOE",
                                        "BerlakuHingga": "SEUMUR HIDUP",
                                        "Pekerjaan": "PEGAWAI SWASTA",
                                        "StatusPerkawinan": "BELUM KAWIN"
                                    }
                                }
                            ],
                            "callbackUrl": "https://ca5f-103-29-150-88.ngrok-free.app/api/issuer/agent",
                            "nonce": "PBib84HD7J7562xUd"
                        }
                    }
                }) :
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: ReasonPhrases.BAD_REQUEST + ", invalid credential type"
                })

    } catch (error) {
        res
            .status(StatusCodes.BAD_REQUEST)
            .send({ message: ReasonPhrases.BAD_REQUEST });
    }
}