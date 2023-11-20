import { ConnectService } from "@/backend/ConnectService";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "POST") {
    res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
    return;
  }

  try {
    const connectService = new ConnectService();
    connectService.disconnect();

    res.status(StatusCodes.OK).json({ result: "disconnected" });
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: ReasonPhrases.BAD_REQUEST });
  }
}
