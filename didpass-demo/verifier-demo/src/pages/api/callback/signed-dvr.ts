import { NextApiRequest, NextApiResponse } from 'next';
import { StatusCodes } from 'http-status-codes';
import { SIWEDTO } from '@didpass/verifier-sdk';

import { allowCors } from '@utils/cors';
import { VerifierServiceInstance } from '@backend/services/VerifierService';

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
    const sessionId: string = req.query.sessionId as string;

    if (!sessionId) {
      throw 'Empty Session ID!';
    }

    const payload = req.body;
    if (payload?.message && payload?.signature) {
      const siweDto: SIWEDTO = {
        siweMessage: payload.message,
        siweSignature: payload.signature,
      };
      const verifyRequest = await VerifierServiceInstance.createSignedDvr(
        sessionId,
        siweDto
      );

      return res.status(StatusCodes.OK).send({
        status: StatusCodes.OK,
        statusText: 'Full Dvr created',
        data: verifyRequest,
      });
    } else {
      throw 'Signature is incorrect or missing';
    }
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: StatusCodes.BAD_REQUEST,
      statusText: err as string,
    });
  }
}
