import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { QR } from "@/backend/types/QR";
import { PrimaryButton } from "../Button/PrimaryButton";
import Toast, { ToastConfig } from "../Toast";
import LogoBlack from "./LogoBlack.json";
import styles from "./ShowQr.module.css";
import Cookies from "js-cookie";

type Props = {
  qr: QR;
  size: number;
  qrConnect: boolean;
  description?: string;
  note?: string;
  purpose: string;
};

const ShowQr = (props: Props) => {
  const { push } = useRouter();

  const [toastConfig, setToastConfig] = useState<ToastConfig>({
    message: "",
    severity: "success",
    open: false,
  });

  useEffect(() => {
    if (!props.qrConnect) return;
    const interval = setInterval(async () => {
      const req = await fetch(`/api/issuer/connect/status/${props.qr.id}`);
      const session = await req.json();
      if (req.ok) {
        Cookies.set("_user", JSON.stringify(session.data));
        clearInterval(interval);
        push("/credentials");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [props.qr, props.qrConnect, push]);

  useEffect(() => {
    var qrcode = document.getElementById("connect-qr");
    if (qrcode) {
      qrcode.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const copyQr = async () => {
    await navigator.clipboard.writeText(JSON.stringify(props.qr.qrCode));
    setToastConfig({
      severity: "success",
      message: (
        <div className={styles.blackFont}>
          <b className={styles.blackFont}>QR Code</b> copied to your clipboard.
        </div>
      ),
      open: true,
    });
  };

  const downloadQr = () => {
    const canvasSave = document.getElementById(
      "connect-qr"
    ) as HTMLCanvasElement;
    if (!canvasSave) return;
    const qrImage = canvasSave.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = qrImage;
    link.download = "QR.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastConfig({
      severity: "success",
      message: (
        <div className={styles.blackFont}>
          <b className={styles.blackFont}>QR Code</b> has been downloaded to
          your device.
        </div>
      ),
      open: true,
    });
  };

  const handleToastClose = () => {
    setToastConfig({
      ...toastConfig,
      open: false,
    });
  };

  return (
    <div className={styles.showQr}>
      <Toast handleClose={handleToastClose} config={toastConfig} />
      <div className={styles.container}>
        <p className={styles.info}>
          {props.description ||
            `Please use your wallet to scan this QR code to ${props.purpose} your SSI account.`}
        </p>
        <QRCode
          id="connect-qr"
          qrStyle="dots"
          value={JSON.stringify(props.qr.qrCode)}
          logoImage={LogoBlack.src}
          removeQrCodeBehindLogo={true}
          quietZone={10}
          size={500}
        />
        {props.note ? (
          <span className={styles.note}>{props.note}</span>
        ) : (
          <div className={styles.spacing}></div>
        )}
        <div className={styles.buttonContainer}>
          <PrimaryButton onClick={copyQr}>Copy QR</PrimaryButton>
          <PrimaryButton onClick={downloadQr}>Download QR</PrimaryButton>
        </div>
        <div className={styles.separator} />
        <div className={styles.buttonContainer}>
        </div>
      </div>
    </div>
  );
};

export default ShowQr;
