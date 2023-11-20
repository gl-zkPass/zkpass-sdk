import { VerifierServiceInstance } from '@backend/services/VerifierService';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(StatusCodes.NOT_FOUND).send({
      status: StatusCodes.NOT_FOUND,
      statusText: 'API endpoint not found',
    });
  }

  const sessionId: string = req.body.sessionId;

  if (!sessionId) {
    res.status(StatusCodes.BAD_REQUEST).send({
      status: StatusCodes.BAD_REQUEST,
      statusText: ReasonPhrases.BAD_REQUEST + ', empty session id',
    });
    return;
  }

  try {
    const result = await VerifierServiceInstance.checkStatus(sessionId);

    res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      statusText: 'Status checked',
      data: result,
    });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send({
      status: StatusCodes.BAD_REQUEST,
      statusText: err as string,
    });
  }
}
