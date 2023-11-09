import { VerificationStatus, DidPassVerifier } from "@didpass/sdk";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  status: VerificationStatus;
};

const DIDPASS_API_KEY = process.env.DIDPASS_API_KEY || "";
const DIDPASS_ENVIRONMENT = process.env.DIDPASS_ENVIRONMENT || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET") {
    res.status(404);
    return;
  }
  const { requestId } = req.query;

  if (requestId !== undefined) {
    const status = await checkStatus(requestId.toString());

    res.status(200).json({ status });
  }
}

async function checkStatus(requestId: string): Promise<VerificationStatus> {
  const didPass = new DidPassVerifier(DIDPASS_API_KEY, DIDPASS_ENVIRONMENT);
  let status = (await didPass.checkStatus(requestId)).statusType;
  return status;
}
