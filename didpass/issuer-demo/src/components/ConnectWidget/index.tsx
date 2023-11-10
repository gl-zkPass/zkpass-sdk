import styles from "./ConnectWidget.module.css";

type Props = {
  setQr: (value: any) => void;
};

const ConnectWidget = (props: Props) => {
  const onConnectClick = async () => {
    const req = await fetch(`/api/issuer/connect`);
    const qrData = await req.json();
    props.setQr(qrData);
  };

  return (
    <div className={styles.connectWidget} data-testid="connect-widget">
      <div className={styles.headlineSubhead}>
        <b className={styles.connectYourKyc}>Connect your digital wallet</b>
        <div className={styles.thisWebsiteIsContainer}>
          <p className={styles.thisWebsiteIs}>
            This website is for testing only
          </p>
          <ul className={styles.pleaseDontUsePersonalOrS}>
            <li className={styles.pleaseDontUse}>
              Please don't use personal or sensitive data when creating issuer
              or verifier proofs.
            </li>
            <li>Test data will be deleted within a week of creation.</li>
          </ul>
        </div>
      </div>
      <button
        data-testid="connect-widget-generate-button"
        className={styles.landingPageButtonPrimary}
        onClick={onConnectClick}
      >
        <b className={styles.getNotifiedAbout}>Connect</b>
      </button>
    </div>
  );
};

export default ConnectWidget;
