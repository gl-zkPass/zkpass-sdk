import { VerifyCaseType } from '../types/VerifierTypes';
import { KtpField, VerifyOperator } from '@backend/types/credentials/type';

// Credential types to be verified
export enum CredType {
  Ktp = "KtpCred",
}

// You can add more cases here
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
  // You can assign which credentials the use case corresponds to here
  switch(caseIndex){
    case VerifyCase.KTP_AGE_ABOVE:
      return CredType.Ktp;
    default: 
      return null;
  };
};

export function retrieveDvrTitle(queryId: string): string {
  let dvrTitle = '';

  // You can assign or add the corresponding DVR title for each case here
  switch (parseInt(queryId)) {
    case VerifyCase.KTP_AGE_ABOVE:
      dvrTitle = "Age above 17";
      break;
  };

  return dvrTitle;
};

// You can add details of use cases here
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
  
