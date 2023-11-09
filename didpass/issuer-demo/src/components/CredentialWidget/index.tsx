import { PrimaryButton } from "../Button/PrimaryButton";
import styles from "./CredentialWidget.module.css";
import { Tooltip } from "@mui/material";
import { QrCodeScanner } from "@mui/icons-material";
import { getToken } from "@/utils/cookie";
import { QR } from "@/backend/types/QR";
import { QrModalConfig } from "@/backend/types/QRModalConfig";
import { PageConfig } from "@/backend/types/PageConfig";

const IndividualCredential = (key: string, value: string) => {
  return (
    <div key={key}>
      <p>
        <b>{key}: </b>
        {value}
      </p>
    </div>
  );
};

type Props = {
  claim: any;
  qrModalConfig: QrModalConfig;
  setQrModalConfig: (config: QrModalConfig) => void;
  setClaimQr: (qr: QR) => void;
  pageConfig: PageConfig;
  setPageConfig: (config: PageConfig) => void;
};

const CredentialWidget = (props: Props) => {
  //map over props and return IndividualCredential\
  const { setClaimQr, qrModalConfig, setQrModalConfig, claim } = props;
  const userData = JSON.parse(claim.user_data).credentialSubject;

  const getClaimQR = async (
    title: string,
    claimId: string,
    type: string = "VC"
  ) => {
    const token = getToken();
    const url: string = `/api/issuer/credentials/qrcode/${type}`;
    const config: RequestInit = {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const req = await fetch(url, config);
    const claimData = await req.json();
    if (req.ok) {
      let purpose = `add your ${title} credential to`;
      
      setClaimQr({
        id: claimId,
        qrCode: claimData.result,
      });
      setQrModalConfig({
        ...qrModalConfig,
        open: true,
        title: `Scan QR for ${title}`,
        purpose: purpose,
      });
    }
  };
  return (
    <>
      {Object.keys(userData).map((key) => {
        return IndividualCredential(key, userData[key]);
      })}
      <div className={styles.actionButtonContainer}>
        <Tooltip
          title={"Sync to wallet using VC"}
          arrow
          placement="top"
          slotProps={{
            tooltip: {
              sx: {
                backgroundColor: "#505050CC",
              },
            },
            arrow: {
              sx: {
                color: "#505050CC",
              },
            },
          }}
        >
          <PrimaryButton
            className={styles.actionButton}
            onClick={() => getClaimQR("KYC eKTP", claim.id, "VC")}
          >
            <QrCodeScanner />
          </PrimaryButton>
        </Tooltip>
        <Tooltip
          title={"Sync to wallet using JWT"}
          arrow
          placement="top"
          slotProps={{
            tooltip: {
              sx: {
                backgroundColor: "#505050CC",
              },
            },
            arrow: {
              sx: {
                color: "#505050CC",
              },
            },
          }}
        >
          <PrimaryButton
            className={styles.actionButton}
            onClick={() => getClaimQR("KYC eKTP", claim.id, "JWT")}
          >
            <QrCodeScanner />
          </PrimaryButton>
        </Tooltip>
      </div>
    </>
  );
};

export default CredentialWidget;
