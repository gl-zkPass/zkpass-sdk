import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import userDataMock from "@/backend/mocks/userDataMock.json"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    try {
        await getCredentials(req, res);
    } catch (error) {
        res
            .status(StatusCodes.BAD_REQUEST)
            .send({ message: ReasonPhrases.BAD_REQUEST });
    }
}

async function getCredentials(req: NextApiRequest, res: NextApiResponse) {
    //below is mock
    const response = {
        credential: {
            id: 6,
            user_data: JSON.stringify({
                'credentialSubject': userDataMock
            }),
        }
        ,
        "total": 1
    }

    res.status(StatusCodes.OK).json(response);
}

