import { NextApiRequest, NextApiResponse } from 'next';
import { StatusCodes } from 'http-status-codes';
import { allowCors } from '@/utils/cors';

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
    
  }catch(err){
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: StatusCodes.BAD_REQUEST,
      statusText: err as string,
    });
  };
};