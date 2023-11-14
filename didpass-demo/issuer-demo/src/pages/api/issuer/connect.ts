import { container } from "@/backend/inversify.config";
import { ConnectService } from "@/backend/issuer/ConnectService";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "GET") {
    res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
    return;
  }

  const connectService = container.get<ConnectService>("ConnectService");
  const [id, qrCode] = await connectService.getConnectQR();

  res.status(StatusCodes.OK).json({
    id: id,
    qrCode: qrCode,
  });
}
