import { NextApiRequest, NextApiResponse } from 'next';
import { StatusCodes } from 'http-status-codes';
import { SIWEDTO } from '@didpass/verifier-sdk';

import { container } from '@backend/inversify.config';
import { allowCors } from '@utils/cors';
import { RequestService } from '@backend/services/RequestService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await allowCors(req, res, ["POST"]);

  if (req.method !== "POST") {
    return res.status(StatusCodes.NOT_FOUND).send({
      status: StatusCodes.NOT_FOUND,
      statusText: "API endpoint not found",
    });
  }

  try{
    const sessionId: string = req.query.sessionId as string;
    
    if (!sessionId) {
      throw "Empty Session ID!";
    }

    const payload = req.body;
    if (payload?.message && payload?.signature) {
      const siweDto: SIWEDTO = {
        siweMessage: payload.message,
        siweSignature: payload.signature,
      };
      
      const requestService = container.get<RequestService>(
        "RequestService"
        );
      const verifyRequest = await requestService.retrieveSignedDvr(sessionId, siweDto);

      res.status(StatusCodes.OK).send({
        status: StatusCodes.OK,
        statusText: "Full Dvr created",
        data: verifyRequest,
      });
    } else {
      throw "Signature is incorrect or missing";
    }
  }catch(err) {
    console.log(err);
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: StatusCodes.BAD_REQUEST,
      statusText: err as string,
    });
  };
};