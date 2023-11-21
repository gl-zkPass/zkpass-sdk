import { CredType, VerifyCase } from '@backend/cases/useCase';

export enum VerifierUseCase {
  AGE_ABOVE_17 = "Age : Above 17 years old",
}

export const VerfiyData = [
  {
    name: CredType.Ktp,
    useCases: [
      {
        name: VerifierUseCase.AGE_ABOVE_17,
        description:
          "This case verifies the user's identity using KYC eKTP data from their wallet, which includes their date of birth, to ensure that the user has reached the minimum age of 17 years required to access our services.",
        useCaseNumber: VerifyCase.KTP_AGE_ABOVE,
      },
    ],
  }
];