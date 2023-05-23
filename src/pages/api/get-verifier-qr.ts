import {
  CredType,
  IVerifyCriteria,
  IVerifyRequestReceipt,
  KycKtpField,
  VerifierSDK,
  VerifyOperator,
  VerifyRequest,
} from "didpass";
import type { NextApiRequest, NextApiResponse } from "next";

export type QrData = {
  data: string;
  requestId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QrData>
) {
  if (req.method !== "GET") {
    res.status(404);
    return;
  }
  const qrData = await getQr();

  res.status(200).json(qrData);
}

async function getQr() {
  const didPass = new VerifierSDK("YOUR_API_KEY", "ENVIRONMENT");
  let criteria: IVerifyCriteria = {
    credField: KycKtpField.BirthDate,
    verifyOperator: VerifyOperator.lessThan,
    value: 20080101,
  };

  const verifyRequest = new VerifyRequest(CredType.Ktp, criteria);
  const verifyRequestReceipt: IVerifyRequestReceipt =
    await didPass.requestVerification(verifyRequest);
  let requestId = verifyRequestReceipt.id as string;
  const qrData = JSON.stringify(verifyRequestReceipt.qrCode, null, 2);
  return {
    requestId,
    data: qrData,
  };
}
