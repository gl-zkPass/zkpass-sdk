import { getDidFromRequestHeaders } from "@/backend/helper";
import { IssuerService } from "@/backend/IssuerService";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
    return;
  }

  let header;
  try {
    header = await getDidFromRequestHeaders(req);
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: ReasonPhrases.UNAUTHORIZED });
  }

  try {
    const body = JSON.parse(req.body);
    const credentialId: string = body.credentialId;

    if (credentialId === undefined) {
      res.status(StatusCodes.BAD_REQUEST).send({
        message: ReasonPhrases.BAD_REQUEST + ", empty credential id",
      });
      return;
    }

    const issuerService = new IssuerService();

    const result = await issuerService.checkScanStatus(header.did);
    res.status(StatusCodes.OK).json({
      ...result,
    });
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST });
  }
}
