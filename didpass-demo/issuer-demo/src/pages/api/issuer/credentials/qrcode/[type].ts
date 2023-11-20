import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { getDidFromRequestHeaders } from "@/backend/helper";
import { IssuerService } from "@/backend/IssuerService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    let header;
    try {
      header = await getDidFromRequestHeaders(req);
    } catch (error) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: ReasonPhrases.UNAUTHORIZED });
    }
    const { type } = req.query;
    const { did } = header;
    if (!type) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: ReasonPhrases.BAD_REQUEST + ", empty credential Id" });
    }
    const issuerService = new IssuerService();
    try {
      const { result } = await issuerService.getCredentialQRCode(
        did,
        type!.toString()
      );
      res.status(StatusCodes.OK).json({
        result,
      });
      return;
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        result: { message: error },
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST + ", " + error });
  }
}
