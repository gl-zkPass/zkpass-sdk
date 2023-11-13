import { NextApiRequest, NextApiResponse } from 'next';
import { container } from '@backend/inversify.config';
import { allowCors } from '@utils/cors';
import { StatusCodes } from 'http-status-codes';
import { SIWEDTO, VerifyZkpassProofOutput } from '@didpass/verifier-sdk';
import { RequestService } from '@backend/services/RequestService';
import { WalletCallbackParams } from '@backend/types/ProofVerifierTypes';

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

  try {
    const sessionId: string = req.query.sessionId as string;
    if (!sessionId) {
      throw "empty session id";
    }

    const zkpassProofToken: string = req.body.proof;
    if (!zkpassProofToken) {
      throw "Proof is invalid or empty";
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

      const params: WalletCallbackParams = {
        zkpassProofToken,
        sessionId,
        siweDto,
      };
      const result = (await requestService.verifyProof(
        params
      )) as VerifyZkpassProofOutput;

      return res.status(StatusCodes.OK).send({
        status: StatusCodes.OK,
        statusText: `Query is ${result.result ? "Verified" : "Unverified"}`,
        data: result,
      });
    } else {
      throw "Signature is incorrect or missing";
    }
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: StatusCodes.BAD_REQUEST,
      statusText: err as string,
    });
  }
};