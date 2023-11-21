import { ConnectService } from "@/backend/ConnectService";
import {
  IConnectQRPayload,
  IWalletResponse,
} from "@didpass/issuer-sdk/lib/types/WalletDTO";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "POST") {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: "API endpoint not found" });
  }

  if (req.body == "undefined") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST });
  }

  let response: IWalletResponse;

  try {
    const connectPayload: IConnectQRPayload = req.body;
    const connectService = new ConnectService();
    await connectService.authorize(connectPayload);

    response = {
      status: StatusCodes.OK,
      statusText: ReasonPhrases.OK,
    };
  } catch (error) {
    console.log(error);

    response = {
      status: StatusCodes.BAD_REQUEST,
      statusText: ReasonPhrases.BAD_REQUEST,
    };
  }

  return res.status(response.status).send(response);
}
