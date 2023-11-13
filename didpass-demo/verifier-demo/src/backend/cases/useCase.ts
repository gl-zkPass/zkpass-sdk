import { VerifyCaseType } from '../types/VerifierTypes';
import { KtpField, VerifyOperator } from '@backend/types/credentials/type';

export enum CredType {
  Ktp = "KtpCred",
}

export enum VerifyCase {
  KTP_AGE_ABOVE,
}

const getMinimumBirthdate = (): number => {
  const currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() - 17);
  const minimumBirthdate = currentDate
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  return parseInt(minimumBirthdate);
};

export function retrieveCaseType(caseIndex: number) : string | null{
  switch(caseIndex){
    case VerifyCase.KTP_AGE_ABOVE:
      return CredType.Ktp;
    default: 
      return null;
  };
};

export const verifyCaseMap: Record<VerifyCase, VerifyCaseType[]> = {
  [VerifyCase.KTP_AGE_ABOVE]: [
    {
      case: VerifyCase.KTP_AGE_ABOVE,
      field: KtpField.BirthDate,
      operator: VerifyOperator.lessThan,
      value: getMinimumBirthdate(),
    }
  ]
}
  
