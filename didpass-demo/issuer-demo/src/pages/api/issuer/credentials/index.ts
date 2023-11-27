import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import detailCredentialMock from "@/backend/mocks/detailCredentialMock.json";

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
  const response = {
    credential: {
      id: detailCredentialMock.id,
      user_data: JSON.stringify(detailCredentialMock.user_data),
    },
    total: 1,
  };

  res.status(StatusCodes.OK).json(response);
}
