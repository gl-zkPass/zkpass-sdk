import { useEffect, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';

import styles from './ShowQr.module.css';
import Loader from '../Loader/Loader';
import useFetch from '../../pages/hooks/useFetch';
import LogoBlack from './LogoBlack.json';
import { VerificationStatus } from '@backend/types/VerifierTypes';
import { useRouter } from 'next/router';

type QR = {
  id: string;
  qrCode: object;
};

let checkStatusInterval: any = null;

const ShowQr = () => {
  const router = useRouter();
  const { fetchData } = useFetch();

  const [qrData, setQrData] = useState<QR | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRetrieveQr = async () => {
    setLoading(true);

    const requestBody = {
      queryId: 0,
    };

    // fetch data from the backend
    await fetchData('/api/request/request-verification', 'POST', requestBody).then((res) => {
      return res.json();
    }).then((data) => {
      setLoading(false);
      setQrData(data.data);
    }).catch(() => {
      alert('Something went wrong when trying to retrieve the QR!');
      router.back();
    });
  };

  useEffect(() => {
    if (!qrData) return;

    const checkStatus = async () => {
      if (checkStatusInterval !== null) clearInterval(checkStatusInterval);

      // check status every 5 seconds
      checkStatusInterval = setInterval(async () => {
        const requestBody = { sessionId: qrData.id };

        // fetch verification status from the backend
        const req = await fetchData('/api/request/check-status', 'POST', requestBody);
        const status = (await req.json()).data;

        if (req.ok) {
          if (status.statusType === VerificationStatus.PENDING) return;
          else if (status.statusType === VerificationStatus.VERIFIED) router.push({
            pathname: '/result',
            query: { success: true },
          });
          else router.push({
            pathname: '/result',
            query: { success: false },
          })
        };
      }, 5000);
    }

    checkStatus();

    return () => {
      if (checkStatusInterval) {
        clearInterval(checkStatusInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrData]);

  if (loading) {
    return <Loader />
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Start Verification</h2>
      <p className={styles.description}>
        {!qrData ?
          'Press the button to generate the QR and then scan it using your wallet!'
          :
          'Scan the QR code using your wallet and continue process until proof verification!'
        }
      </p>
      <div className={styles.qrcode}>
        <QRCode
          id="connect-qr"
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          size={340}
          qrStyle="dots"
          value={JSON.stringify(qrData?.qrCode)}
          logoImage={LogoBlack.src}
          removeQrCodeBehindLogo={true}
        />

        {
          !qrData ? <div className={styles.qrcode_overlay}>QR not yet generated</div> : <></>
        }
      </div>

      <p className={styles.note}><span className={styles.note_highlight}>Note: </span> Every 5 seconds, a request will be sent out to check the current verification status.</p>

      {
        !qrData &&
        <button onClick={handleRetrieveQr} className={styles.button} disabled={qrData !== undefined}>Retrieve QR Code</button>
      }
    </section>
  )

};

export default ShowQr;