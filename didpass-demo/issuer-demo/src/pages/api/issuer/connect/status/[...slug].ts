import { ConnectService } from "@/backend/ConnectService";
import { NextApiRequest, NextApiResponse } from "next";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

type Status = {
  message: string;
  data?: {};
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Status>
) {
  if (req.method !== "GET") {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: "API endpoint not found" });
  }
  const { slug: uuid } = req.query;
  if (uuid === undefined) {
    return res.status(StatusCodes.BAD_REQUEST).send({ message: "Slug error" });
  }
  const connectService = new ConnectService();
  const result = await connectService.checkStatus(uuid.toString());
  if (result.did) {
    return res
      .status(StatusCodes.OK)
      .send({ message: ReasonPhrases.OK, data: result });
  }
  return res
    .status(StatusCodes.BAD_REQUEST)
    .send({ message: ReasonPhrases.BAD_REQUEST + ", session not found" });
}
