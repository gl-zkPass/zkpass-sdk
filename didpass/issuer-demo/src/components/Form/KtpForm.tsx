import { Box, Tooltip } from "@mui/material";
import { StatusCodes } from "http-status-codes";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getToken } from "../../utils/cookie";
import { OutlinedButton } from "../Button/OutlinedButton";
import { PrimaryButton } from "../Button/PrimaryButton";
import styles from "./Form.module.css";

export enum ScanType {
  KTP = "ktp",
  Liveness = "liveness",
}

interface LoadingType {
  ktp: boolean;
  liveness: boolean;
}

interface KycStatus {
  ktp: boolean;
  liveness: boolean;
}

interface isVerified {
  ktp: boolean;
  liveness: boolean;
}

const KycKtpForm = () => {
  const [ktpFile, setKtpFile] = useState<File | undefined>();
  const [selfieFile, setSelfieFile] = useState<File | undefined>();
  const [kycStatus, setKycStatus] = useState<KycStatus>({
    ktp: false,
    liveness: false,
  });
  const [loading, setLoading] = useState<LoadingType>({
    ktp: false,
    liveness: false,
  });
  const [loadingCredential, setLoadingCredential] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isVerified, setIsVerified] = useState<isVerified>({
    ktp: false,
    liveness: false,
  });
  const [loadingIdentity, setLoadingIdentity] = useState<boolean>(false);
  const router = useRouter();

  const onVerify = async () => {
    if (ktpFile == undefined || selfieFile == undefined) {
      return;
    }
    if (kycStatus.ktp && kycStatus.liveness) {
      await createCredentials();
    }
  };

  const createCredentials = async () => {
    setLoadingCredential(true);
    setMessage("");
    const token = getToken();
    const url: string = `/api/ssi/issuer/credentials`;
    const config: RequestInit = {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credType: CredType.KTP,
      }),
    };
    const response: Response = await fetch(url, config);
    const data = await response.json();
    setLoadingCredential(false);

    if (data.result?.result?.id) {
      setSuccess(true);
      router.push({
        pathname: "/issuer/credentials",
        query: {
          kyc: CredentialTypeEnum.KtpCred,
          success: true,
        },
      });
    } else {
      setSuccess(false);
      const baseError = "Error creating credentials";
      setMessage(data.message ? `${baseError}: ${data.message}` : baseError);
      console.error(data);
    }
  };

  const goBack = () => {
    router.replace("/issuer/credentials");
  };


//   useEffect(() => {
//     if (!ktpFile) {
//       setKycStatus((state) => ({
//         ...state,
//         ktp: false,
//       }));
//     }
//     if (!selfieFile) {
//       setKycStatus((state) => ({
//         ...state,
//         liveness: false,
//       }));
//     }
//   }, [ktpFile, selfieFile]);

//   useEffect(() => {
//     const faceVerification = async () => {
//       setMessage("");
//       changeLoading(true, ScanType.KTP);
//       setLoadingIdentity(true);

//       const token = getToken();
//       const url: string = `/api/ssi/issuer/identity`;
//       const config: RequestInit = {
//         method: "GET",
//         headers: {
//           authorization: `Bearer ${token}`,
//         },
//       };
//       const response: Response = await fetch(url, config);
//       const data = await response.json();

//       if (data.verification_status) {
//         setIsVerified({ ktp: data.isVerified, liveness: data.isVerified });
//       } else {
//         setIsVerified({ ktp: false, liveness: false });
//         setKycStatus({ ktp: false, liveness: kycStatus.liveness });
//         setMessage(
//           data.reason ??
//             data.message ??
//             "Error verify your eKTP & Selfie, please upload the correct ones"
//         );
//       }
//       changeLoading(false, ScanType.KTP);
//       setLoadingIdentity(false);
//     };
//     if (kycStatus.ktp && kycStatus.liveness) {
//       faceVerification();
//     }
//   }, [kycStatus]);

  return (
    <div className={styles.container}>
      <KtpDropzone
        ktpFile={ktpFile}
        setKtpFile={setKtpFile}
        loading={loading || loadingIdentity}
        scan={scanFile}
        success={kycStatus.ktp}
        tooltip={getToolTipTitle()}
        isVerified={isVerified.ktp}
      />
      {message != "" && <div className={styles.errorMessage}>{message}</div>}
      <div className={styles.buttonContainer}>
        <OutlinedButton
          sx={{
            height: "46px",
            width: "128px",
            borderColor: "var(--color-aqua)",
            color: "var(--color-aqua)",
          }}
          onClick={goBack}
          disabled={success}
        >
          Cancel
        </OutlinedButton>
        <Tooltip
          title={
            <div className={styles.tootlTipText}>
              <div>
                Please wait until <b>KTP</b> scanning done.
              </div>
              <div>It will take +/- 30 seconds.</div>
            </div>
          }
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
          <Box>
            <PrimaryButton
              sx={{
                borderRadius: "8px",
                height: "46px",
                width: "128px",
              }}
              onClick={onVerify}
              disabled={
                !kycStatus.ktp ||
                !kycStatus.liveness ||
                success ||
                loadingCredential ||
                loadingIdentity
              }
            >
              Submit
            </PrimaryButton>
          </Box>
        </Tooltip>
        {loadingCredential && (
          <span className={styles.loading}> Creating your credential ...</span>
        )}
        {success && <span className={styles.loading}>Success</span>}
      </div>
    </div>
  );
};

export default KycKtpForm;
