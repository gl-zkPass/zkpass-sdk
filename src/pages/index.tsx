import {
  CredType,
  IVerifyCriteria,
  IVerifyRequestReceipt,
  KycKtpField,
  VerifierSDK,
  VerifyOperator,
  VerifyRequest,
} from "didpass";
import { useEffect, useState } from "react";

const criteria: IVerifyCriteria = {
  credField: KycKtpField.BirthDate,
  verifyOperator: VerifyOperator.lessThan,
  value: 20080101,
};
const didPass = new VerifierSDK(
  "7f5912dc-ec21-11ed-9ef2-06a8434e4f5e",
  "development"
);

export default function Home() {
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    generateQR();
  }, []);

  async function generateQR() {
    let criteria: IVerifyCriteria = {
      credField: KycKtpField.BirthDate,
    };

    criteria = {
      ...criteria,
      verifyOperator: VerifyOperator.lessThan,
      value: 20080101,
    };

    const verifyRequest = new VerifyRequest(CredType.Ktp, criteria);
    console.log(verifyRequest);
    const verifyRequestReceipt: IVerifyRequestReceipt =
      await didPass.requestVerification(verifyRequest);
    let requestId = verifyRequestReceipt.id as string;
    const qrString = JSON.stringify(verifyRequestReceipt.qrCode, null, 2);
    setQr(qrString);
  }

  return <>{qr}</>;
}
