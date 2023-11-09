import { IssuerScanStatus,IIssuerScanResponse } from "@/backend/issuer/dto/IssuerScanStatus";
import Link from "@mui/material/Link";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { QR } from "@/backend/types/QR";
import { PrimaryButton } from "@/components/Button/PrimaryButton";
import MainContainer from "@/components/Container/MainContainer";
// import CredentialDataTable from "../../../components/DataTable/CredentialDataTable";
import Toast,{ToastConfig} from "@/components/Toast";
import { Claim } from "@/backend/types/Claims";
import { getToken, removeUserCookie } from "@/utils/cookie";
import styles from "./index.module.css";
import CredentialWidget from "@/components/CredentialWidget";
import { QrModalConfig } from "@/backend/types/QRModalConfig";
import QrModal from "@/components/QrModal";



export type PageConfig = {
  limit: number;
  offset: number;
};

const INITIAL_LIMIT = 10;
const INTIIAL_OFFSET = 0;

const Credentials = () => {
  const router = useRouter();
  const token = getToken();
  const [claims, setClaims] = useState<Claim>();
  const [pageConfig, setPageConfig] = useState<PageConfig>({
    limit: Number(Cookies.get("limit")) || INITIAL_LIMIT,
    offset: INTIIAL_OFFSET,
  });
  const [claimQr, setClaimQr] = useState<QR | undefined>();
  const [qrModalConfig, setQrModalConfig] = useState<QrModalConfig>({
    open: false,
    title: "",
    qrData: "",
    purpose: "",
  });
  const [toastConfig, setToastConfig] = useState<ToastConfig>({
    message: "",
    severity: "success",
    open: false,
  });

  const handleQrModalClose = () => {
    setClaimQr(undefined);
    setQrModalConfig({
      ...qrModalConfig,
      open: false,
    });
  };

  const fetchClaims = async () => {
    try {
      const token = getToken();
      const req = await fetch(
        `/api/issuer/credentials`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const claims = await req.json();
      if (req.ok) {
        setClaims(claims.credential);
      } else {
        removeUserCookie();
        router.reload();
      }
    } catch (e) {
      removeUserCookie();
      router.reload();
    }
  };

  useEffect(() => {
    Cookies.set("limit", JSON.stringify(pageConfig.limit));
    fetchClaims();
  }, [pageConfig]);

  useEffect(() => {
    if (Object.keys(router.query).length != 0) {
      const { kyc, success } = router.query;
      setToastConfig({
        severity: success ? "success" : "error",
        message: (
          <div className={styles.blackFont}>
            {success ? "Success! " : "Error! "}
            <b className={styles.blackFont}>{kyc}</b>{" "}
            {success
              ? " credential has been submitted."
              : " credential cannot be submitted"}
          </div>
        ),
        open: true,
      });
      delete router.query.kyc;
      delete router.query.success;
      router.push(router);
    }
  }, [router]);

  const handleToastClose = () => {
    setToastConfig({
      ...toastConfig,
      open: false,
    });
  };

  useEffect(() => {
    if (!claimQr) return;
    const interval = setInterval(async () => {
      const config: RequestInit = {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ credentialId: claimQr.id }),
      };
      const req = await fetch(
        `/api/issuer/credentials/qrcode/status`,
        config
      );
      const res: IIssuerScanResponse = await req.json();
      if (req.ok) {
        if (res.statusType === IssuerScanStatus.SCANNED) {
          setToastConfig({
            severity: "success",
            message: (
              <div className={styles.blackFont}>
                Credential scanned successfully
              </div>
            ),
            open: true,
          });
          clearInterval(interval);
          handleQrModalClose();
        } else if (res.statusType === IssuerScanStatus.NOT_FOUND) {
          setToastConfig({
            severity: "error",
            message: (
              <div className={styles.blackFont}>Credential not found</div>
            ),
            open: true,
          });
          clearInterval(interval);
          handleQrModalClose();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimQr, token]);

  

  return (
    <MainContainer title="Credential List">
      <div>
        {claimQr && (
          <QrModal
            qr={claimQr}
            config={qrModalConfig}
            handleClose={handleQrModalClose}
          />
        )}

        {claims &&  (
          <CredentialWidget 
            claim={claims}
            qrModalConfig={qrModalConfig}
            setQrModalConfig={setQrModalConfig}
            setClaimQr={setClaimQr}
            pageConfig={pageConfig}
            setPageConfig={setPageConfig}
          />
        )}
      </div>

      <Toast handleClose={handleToastClose} config={toastConfig} />
    </MainContainer>
  );
};

export default Credentials;