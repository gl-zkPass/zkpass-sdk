import type { NextPage } from "next";
import { useState } from "react";
import ShowQr from "@/components/ShowQr";
import ConnectWidget from "@/components/ConnectWidget";
import styles from "./index.module.css";
import { QR } from "@/backend/types/QR";

const Connect: NextPage = () => {
  const [qr, setQr] = useState<QR | undefined>();
  return (
    <div className={styles.connect}>
      <div className={styles.frameParent}>
        <div className={styles.content}>
          {qr ? (
            <ShowQr qrConnect={true} qr={qr} size={300} purpose="connect to" />
          ) : (
            <ConnectWidget setQr={setQr} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Connect;
