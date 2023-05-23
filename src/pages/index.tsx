import { VerificationStatus } from "didpass";
import { useCallback, useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { QrData } from "./api/get-verifier-qr";

export default function Home() {
  const [qrData, setQrData] = useState<QrData | undefined>();
  const [status, setStatus] = useState<VerificationStatus>(
    VerificationStatus.PENDING
  );
  useEffect(() => {
    const generateQR = async () => {
      const response = await fetch("/api/get-verifier-qr");
      const data = await response.json();
      setQrData(data);
    };
    generateQR();
  }, []);

  const checkStatus = useCallback(async () => {
    if (!qrData) return VerificationStatus.NOT_FOUND;
    const response = await fetch(`/api/check-status/${qrData.requestId}`);
    const data = await response.json();
    return data;
  }, [qrData]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await checkStatus();
      setStatus(res.status);
    }, 5000);
    return () => clearInterval(interval);
  }, [checkStatus, qrData]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">
        Please use your wallet to scan this QR code to verify your data from
        your SSI account.
      </h2>
      <div className="flex mb-4">
        <QRCode
          id="verifier-qr"
          qrStyle="dots"
          value={qrData?.data}
          removeQrCodeBehindLogo={true}
          quietZone={10}
          size={300}
        />
      </div>

      <p className="text-lg text-white">Verification status: {status}</p>
      <div className="bg-gray-100 p-4">
        <h2 className="text-black">QR Data</h2>
        <pre className="p-4 bg-white rounded-lg shadow-md overflow-x-auto">
          <code className="text-sm text-gray-800">{qrData?.data}</code>
        </pre>
      </div>
    </div>
  );
}
