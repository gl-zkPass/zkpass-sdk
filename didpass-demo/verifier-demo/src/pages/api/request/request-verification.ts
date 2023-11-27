import { NextApiRequest, NextApiResponse } from 'next';
import { StatusCodes } from 'http-status-codes';

import { VerifierServiceInstance } from '@backend/services/VerifierService';
import { allowCors } from '@utils/cors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await allowCors(req, res, ['POST']);

  if (req.method !== 'POST') {
    return res.status(StatusCodes.NOT_FOUND).send({
      status: StatusCodes.NOT_FOUND,
      statusText: 'API endpoint not found',
    });
  }

  try {
    const queryId: string = req.body.queryId;

    const result = await VerifierServiceInstance.requestVerification(queryId);

    res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      statusText: 'Qr code generated',
      data: result,
    });
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: StatusCodes.BAD_REQUEST,
      statusText: err as string,
    });
  }
}
