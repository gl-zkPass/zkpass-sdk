import { NextApiRequest, NextApiResponse } from 'next';
import { StatusCodes } from 'http-status-codes';
import { container } from '@backend/inversify.config';
import { VerifierService } from '@backend/services/VerifierService';
import { RequestService } from '@backend/services/RequestService';
import { RequestVerifyParams } from '@backend/types/VerifierParamTypes';
import { allowCors } from '@utils/cors';

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
    const queryId: string = req.body.queryId;
    
    const requestService = container.get<RequestService>(
      "RequestService"
      );
    const result = await requestService.requestVerification(queryId);

    res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      statusText: "Qr code generated",
      data: result,
    });
  }catch(err){
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: StatusCodes.BAD_REQUEST,
      statusText: err as string,
    });
  };
};