import React, { useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import styles from './index.module.css';

export default function Verifier() {
  const [qrData, setQrData] = useState<string>('');

  useEffect(() => {
    const retrieveQr = async () => {
      await fetch('/api/request/request-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queryId: 0
        })
      }).then((res) => {
        return res.json();
      }).then((data) => {
        setQrData(JSON.stringify(data.data.qrCode));
      })
    };
    retrieveQr();
  }, []);

  return (
    <>
      <h1 className={styles.title}>
        Verifier
      </h1>
      <QRCode value={qrData} qrStyle="dots" size={1000} />
    </>
  )
};