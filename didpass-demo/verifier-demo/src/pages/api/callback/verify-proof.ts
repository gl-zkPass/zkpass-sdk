import { NextApiRequest, NextApiResponse } from 'next';
import { allowCors } from '@utils/cors';
import { StatusCodes } from 'http-status-codes';
import { SIWEDTO } from '@didpass/verifier-sdk';
import { WalletCallbackParams } from '@backend/types/ProofVerifierTypes';
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
      throw 'empty session id';
    }

    const zkpassProofToken: string = req.body.proof;
    if (!zkpassProofToken) {
      throw 'Proof is invalid or empty';
    }

    const payload = req.body;
    if (payload?.message && payload?.signature) {
      const siweDto: SIWEDTO = {
        siweMessage: payload.message,
        siweSignature: payload.signature,
      };

      const params: WalletCallbackParams = {
        zkpassProofToken,
        sessionId,
        siweDto,
      };
      const result = await VerifierServiceInstance.verifyProof(params);

      return res.status(StatusCodes.OK).send({
        status: StatusCodes.OK,
        statusText: `Query is ${result ? 'Verified' : 'Unverified'}`,
        data: {
          result: result,
        },
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
