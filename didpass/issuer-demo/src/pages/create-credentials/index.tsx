import { MenuItem } from "@mui/material";
import Link from "@mui/material/Link";
import { useEffect, useState } from "react";
import MainContainer from "@/components/Container/MainContainer";
import KycKtpForm from "../../../components/Form/KycKtpForm";
import { getToken } from "@/utils/cookie";

enum CredentialTypeEnum {
  KYC_KTP = "KYC eKTP",
  KYC_BANK = "KYC BANK",
  KYC_DOMESTIC_TRAVEL = "KYC DOMESTIC TRAVEL",
}

const CredentialType = Object.values(CredentialTypeEnum);

const breadcrumbs = [
  <Link
    underline="hover"
    className="breadcrumbLink"
    key="1"
    href="/issuer/credentials"
  >
    Credential List
  </Link>,
  <Link
    underline="hover"
    key="1"
    className="breadcrumbLink"
    href="/issuer/create-credentials"
  >
    Add New Credentials
  </Link>,
];

const CreateCredentials = () => {
  const [kycVerified, setKycVerified] = useState<{
    ktp: boolean;
  }>({
    ktp: false,
  });
  const [type, setType] = useState<string>("");

  const onSelectChange = (e: any) => {
    setType(e.target.value);
  };

  const CredentialForm = () => {
      return <KycKtpForm />;
  };

  const checkDisabled = (value: CredentialTypeEnum) => {
    if (!kycVerified.ktp) {
      return value != CredentialTypeEnum.KYC_KTP;
    } else {
      return value == CredentialTypeEnum.KYC_KTP;
    }
  };

  useEffect(() => {
    const checkKyc = async () => {
      const token = getToken();
      const url: string = `/api/ssi/issuer/kyc`;
      const config: RequestInit = {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const response: Response = await fetch(url, config);
      const data = await response.json();
      setKycVerified({ ...data });
      if (data.ktp) {
        setType(CredentialTypeEnum.KYC_BANK);
      } else {
        setType(CredentialTypeEnum.KYC_KTP);
      }
    };
    checkKyc();
  }, []);

  return (
    <MainContainer breadcrumbs={breadcrumbs} title="Add New Credential">
      <div>
        <p className="form-label">Credential Type</p>
        <CredentialForm />
      </div>
    </MainContainer>
  );
};

export default CreateCredentials;
