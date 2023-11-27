import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export const allowCors = async (
  req: NextApiRequest,
  res: NextApiResponse,
  allowedMethods: string[]
) => {
  await NextCors(req, res, {
    methods: allowedMethods,
    origin: "*",
    optionsSuccessStatus: 200,
  });
};
