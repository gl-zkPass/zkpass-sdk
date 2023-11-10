import { NextApiRequest, NextApiResponse } from 'next';
import { allowCors } from '@/utils/cors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await allowCors(req, res, ["POST"]);
  return res.json({purpose: 'Get full DVR Callback'});
};