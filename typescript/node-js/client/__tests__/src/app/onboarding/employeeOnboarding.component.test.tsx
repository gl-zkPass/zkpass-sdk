/*
 * onboarding/employeeOnboarding.component.tsx
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import React, { act } from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import EmployeeOnboarding from "@/app/onboarding/employeeOnboarding.component";
import { MYNAMASTE_URL, VERIFIER_URL } from "@/utils/constants";
import {
  createFetchPromise,
  checkTextToBeInDocument,
  checkTextToBeInDocumentAsync,
} from "../../../test-utils/checks";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const MOCK_DVR_JWT =
  "eyJhbGciOiJFUzI1NiIsImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL3ZlcmlmaWVyLWtleS5qc29uIiwia2lkIjoiay0xIn0.eyJkYXRhIjp7Inprdm0iOiJyMCIsImR2cl90aXRsZSI6Ik9uYm9hcmRpbmcgQmxvb2QgVGVzdCIsImR2cl9pZCI6IjY5OTkxMDk0LTk4NDctNDAwYy1hMmY0LTI5MWYzYjMxOWVlNCIsInF1ZXJ5X2VuZ2luZV92ZXIiOiIxLjEuMCIsInF1ZXJ5X21ldGhvZF92ZXIiOiJhM2E4NzMxMDY5ZmM2MDY5NWI3MDhjZTMxNmJjYjBjOGE3ZmY3MWI3ZTQ3NWI3YjQ4Y2U0YTY4N2FlYjZiNDE2IiwicXVlcnkiOiJbe1wiYXNzaWduXCI6e1wibGFiX2lkXCI6e1wiPT1cIjpbe1wiZHZhclwiOlwibGFiLklEXCJ9LFwiUUg4MDE4NzRcIl19fX0se1wiYXNzaWduXCI6e1widGVzdF9pZFwiOntcIj09XCI6W3tcImR2YXJcIjpcInRlc3RJRFwifSxcIlNDUkVFTi03MDgzLTEyMzQ1XCJdfX19LHtcImFzc2lnblwiOntcInN1YmplY3RfZmlyc3RfbmFtZVwiOntcIn49PVwiOlt7XCJkdmFyXCI6XCJzdWJqZWN0LmZpcnN0TmFtZVwifSxcIkpvaG5cIl19fX0se1wiYXNzaWduXCI6e1wic3ViamVjdF9sYXN0X25hbWVcIjp7XCJ-PT1cIjpbe1wiZHZhclwiOlwic3ViamVjdC5sYXN0TmFtZVwifSxcIkRvZVwiXX19fSx7XCJhc3NpZ25cIjp7XCJzdWJqZWN0X2RhdGVfb2ZfYmlydGhcIjp7XCI9PVwiOlt7XCJkdmFyXCI6XCJzdWJqZWN0LmRhdGVPZkJpcnRoXCJ9LFwiMTk4NS0xMi0xMlwiXX19fSx7XCJhc3NpZ25cIjp7XCJtZWFzdXJlZFBhbmVsc05nTUxfY29jYWluZVwiOntcIjw9XCI6W3tcImR2YXJcIjpcIm1lYXN1cmVkUGFuZWxzTmdNTC5jb2NhaW5lXCJ9LDEwXX19fSx7XCJhc3NpZ25cIjp7XCJ0ZXN0X3Bhc3NlZFwiOntcImFuZFwiOlt7XCJsdmFyXCI6XCJsYWJfaWRcIn0se1wibHZhclwiOlwidGVzdF9pZFwifSx7XCJsdmFyXCI6XCJzdWJqZWN0X2ZpcnN0X25hbWVcIn0se1wibHZhclwiOlwic3ViamVjdF9sYXN0X25hbWVcIn0se1wibHZhclwiOlwic3ViamVjdF9kYXRlX29mX2JpcnRoXCJ9LHtcImx2YXJcIjpcIm1lYXN1cmVkUGFuZWxzTmdNTF9jb2NhaW5lXCJ9XX19fSx7XCJvdXRwdXRcIjp7XCJyZXN1bHRcIjp7XCJsdmFyXCI6XCJ0ZXN0X3Bhc3NlZFwifX19XSIsInVzZXJfZGF0YV9yZXF1ZXN0cyI6eyIiOnsidXNlcl9kYXRhX3VybCI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC92ZXJpZmllciIsInVzZXJfZGF0YV92ZXJpZnlpbmdfa2V5Ijp7IktleXNldEVuZHBvaW50Ijp7ImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL2lzc3Vlci1rZXkuanNvbiIsImtpZCI6ImstMSJ9fX19LCJkdnJfdmVyaWZ5aW5nX2tleSI6eyJLZXlzZXRFbmRwb2ludCI6eyJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy92ZXJpZmllci1rZXkuanNvbiIsImtpZCI6ImstMSJ9fX19.2SAiGcPTufbJRBKvd4oF58aX3tBdSW6X0nqQstF8CEcRk2BZWFuasB6OYV0kZCKrQL0xo3bOPwk66cLoYvbtzQ";
const MOCK_BLOOD_TEST_JWT =
  "eyJhbGciOiJFUzI1NiIsImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL2lzc3Vlci1rZXkuanNvbiIsImtpZCI6ImstMSJ9.eyJkYXRhIjp7InRlc3RJRCI6IlNDUkVFTi03MDgzLTEyMzQ1IiwidGVzdE5hbWUiOiJRdWFsaXR5SGVhbHRoIENvbXByZWhlbnNpdmUgU2NyZWVuIiwidGVzdERhdGUiOiIyMDIzLTA4LTI3VDE0OjAwOjAwWiIsImxhYiI6eyJuYW1lIjoiUXVhbGl0eUhlYWx0aCBMYWJzIiwiSUQiOiJRSDgwMTg3NCIsImFkZHJlc3MiOiIxMjM0IEVsbSBTdCwgT2FrbGFuZCwgVVNBIn0sInN1YmplY3QiOnsiZmlyc3ROYW1lIjoiSm9obiIsImxhc3ROYW1lIjoiRG9lIiwiZGF0ZU9mQmlydGgiOiIxOTg1LTEyLTEyIiwiYmxvb2RUeXBlIjoiQSsiLCJreWMiOnsia3ljSWQiOiJaSzAwMDEiLCJreWNUeXBlIjoiWktQQVNTSUQifSwiRE5BSW5mbyI6eyJtYXJrZXJzIjp7IkFQT0UiOlsiRTMiLCJFMyJdLCJCUkNBMSI6Ik5vcm1hbCIsIk1USEZSIjpbIkM2NzdUIiwiQTEyOThDIl19LCJoYXBsb2dyb3VwcyI6eyJwYXRlcm5hbCI6IlIxYjEiLCJtYXRlcm5hbCI6IkgxYTEifX19LCJtZWFzdXJlZFBhbmVsc05nTUwiOnsiYW1waGV0YW1pbmVzIjowLCJjb2NhaW5lIjo4LCJvcGlhdGVzIjoxMDIsImJlbnpvZGlhemVwaW5lcyI6MH19fQ.t73tYD4D9dMzE_AYwFfzZQYacmM8uiMFyaeSswOEgxeC8W11MRNchOQ46fQ309P3AL9oZckrjZlqWurrLBcTUg";
const MOCK_KYC_JWT =
  "eyJhbGciOiJFUzI1NiIsImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL2lzc3Vlci1rZXkuanNvbiIsImtpZCI6ImstMSJ9.eyJkYXRhIjp7Imt5Y0lkIjoiWkswMDAxIiwia3ljVHlwZSI6IlpLUEFTU0lEIiwic3ViamVjdCI6eyJmaXJzdE5hbWUiOiJKb2huIiwibGFzdE5hbWUiOiJEb2UiLCJkYXRlT2ZCaXJ0aCI6IjE5ODUtMTItMTIiLCJibG9vZFR5cGUiOiJBKyIsImNvbnRhY3QiOnsiZW1haWwiOiJqb2huLmRvZUBnbWFpbC5jb20iLCJwaG9uZSI6IjY1MC01NTUtMTIzNCJ9LCJhZGRyZXNzIjp7InN0cmVldCI6Ijc4OSBPYWsgU3RyZWV0IiwiY2l0eSI6IlNhbiBKb3NlIiwic3RhdGUiOiJDQSIsInppcCI6Ijk1MTM0In19fX0.wkJWVZV6LY7Xs-NobpEJJfS1bbvkC3cMtDtWTNdMSSRYWDEV9QpkvsdnGOz9sKBskafPQ6rv8RqLKzVHP92tLQ";

describe("EmployeeOnboarding", () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.Mock;
  const mockUseSearchParams = useSearchParams as jest.Mock;
  const mockUser = "testuser";

  const MOCK_RESPONSES = {
    DVR: {
      status: 200,
      data: MOCK_DVR_JWT,
    },
    BLOOD_TEST: {
      status: 200,
      data: MOCK_BLOOD_TEST_JWT,
    },
    KYC: {
      status: 200,
      data: MOCK_KYC_JWT,
    },
    PROOF: {
      status: 200,
      data: "some_proof_jwt",
    },
    VERIFY: {
      status: 200,
      data: {
        output: {
          result: true,
        },
      },
    },
    FAILED_FETCH: {
      status: 400,
      message: "Error fetch failed",
    },
    FAILED: {
      status: 200,
      data: "other_string",
    },
  };

  enum ERROR_STATE {
    FETCH,
    DVR,
    BLOOD_TEST,
    KYC,
    PROOF,
    VERIFY,
    NONE,
  }
  const mockFetchImplementation = (
    errorState: ERROR_STATE = ERROR_STATE.NONE
  ) => {
    mockFetch.mockImplementation((url) => {
      if (errorState == ERROR_STATE.FETCH) {
        return createFetchPromise(MOCK_RESPONSES.FAILED_FETCH);
      }

      if (url.includes("/dvrs")) {
        return createFetchPromise(
          errorState == ERROR_STATE.DVR
            ? MOCK_RESPONSES.FAILED
            : MOCK_RESPONSES.DVR
        );
      }
      if (url.includes("/blood_tests")) {
        return createFetchPromise(
          errorState == ERROR_STATE.BLOOD_TEST
            ? MOCK_RESPONSES.FAILED
            : MOCK_RESPONSES.DVR
        );
      }
      if (url.includes("/kyc")) {
        return createFetchPromise(
          errorState == ERROR_STATE.KYC
            ? MOCK_RESPONSES.FAILED
            : MOCK_RESPONSES.KYC
        );
      }
      if (url.includes(`${MYNAMASTE_URL}/api/proofs`)) {
        return createFetchPromise(
          errorState == ERROR_STATE.PROOF
            ? MOCK_RESPONSES.FAILED_FETCH
            : MOCK_RESPONSES.PROOF
        );
      }
      if (url.includes(`${VERIFIER_URL}/proofs`)) {
        return createFetchPromise(
          errorState == ERROR_STATE.VERIFY
            ? MOCK_RESPONSES.FAILED_FETCH
            : MOCK_RESPONSES.VERIFY
        );
      }
    });
  };

  const doGenerateProof = async (
    mode: "MultipleUserData" | "SingleUserData"
  ) => {
    await checkTextToBeInDocumentAsync(
      "Please review the Employee Onboarding questionnaires"
    );

    fireEvent.click(screen.getByText("Confirm and Continue"));
    await checkTextToBeInDocumentAsync("Please review the Blood Test Result");

    if (mode == "MultipleUserData") {
      fireEvent.click(screen.getByText("View KYC Data"));
      await checkTextToBeInDocumentAsync("Please review the KYC Result");

      fireEvent.click(screen.getByText("View Blood_Test Data"));
      await checkTextToBeInDocumentAsync("Please review the Blood Test Result");
    }

    fireEvent.click(screen.getByText("Confirm and Generate Proof"));
    await checkTextToBeInDocumentAsync("Generating Proof...");
  };

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue("multiple"),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("redirects to home if user is not provided", () => {
    render(<EmployeeOnboarding user={undefined} />);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  test("handle successful flow of employeeOnboarding (Multiple User Data)", async () => {
    mockFetchImplementation(ERROR_STATE.NONE);
    render(<EmployeeOnboarding user={mockUser} />);
    checkTextToBeInDocument("Testuser's Employee Onboarding.");

    await doGenerateProof("MultipleUserData");
    await checkTextToBeInDocumentAsync(
      "The blood test and kyc succeeded onboarding requirements."
    );
  });

  test("handle successful flow of employeeOnboarding (Single User Data)", async () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue("single"),
    });
    mockFetchImplementation(ERROR_STATE.NONE);

    render(<EmployeeOnboarding user={mockUser} />);
    checkTextToBeInDocument("Testuser's Employee Onboarding.");

    await doGenerateProof("SingleUserData");
    await checkTextToBeInDocumentAsync(
      "The blood test succeeded onboarding requirements."
    );
  });

  describe("handle error", () => {
    test("handle error empty DVR string", async () => {
      mockFetchImplementation(ERROR_STATE.DVR);

      render(<EmployeeOnboarding user={mockUser} />);
      checkTextToBeInDocument("Testuser's Employee Onboarding.");

      await checkTextToBeInDocumentAsync("Parsing Error on DVR");
    });

    test("handle error empty Blood Test User Data string", async () => {
      mockFetchImplementation(ERROR_STATE.BLOOD_TEST);

      render(<EmployeeOnboarding user={mockUser} />);
      checkTextToBeInDocument("Testuser's Employee Onboarding.");

      await checkTextToBeInDocumentAsync(
        "Parsing Error on Blood Test User Data"
      );
    });

    test("handle error empty KYC User Data string", async () => {
      mockFetchImplementation(ERROR_STATE.KYC);

      render(<EmployeeOnboarding user={mockUser} />);
      checkTextToBeInDocument("Testuser's Employee Onboarding.");

      await checkTextToBeInDocumentAsync("Parsing Error on KYC User Data");
    });

    test("handle error on generating proof", async () => {
      mockFetchImplementation(ERROR_STATE.PROOF);

      render(<EmployeeOnboarding user={mockUser} />);
      checkTextToBeInDocument("Testuser's Employee Onboarding.");

      await doGenerateProof("MultipleUserData");
      await checkTextToBeInDocumentAsync(MOCK_RESPONSES.FAILED_FETCH.message);
    });

    test("handle error on verifying proof (Multiple User Data)", async () => {
      mockFetchImplementation(ERROR_STATE.VERIFY);

      render(<EmployeeOnboarding user={mockUser} />);
      checkTextToBeInDocument("Testuser's Employee Onboarding.");

      await doGenerateProof("MultipleUserData");
      await checkTextToBeInDocumentAsync(
        "The blood test and/or kyc failed onboarding requirements."
      );
    });

    test("handle error on verifying proof (Single User Data)", async () => {
      mockUseSearchParams.mockReturnValue({
        get: jest.fn().mockReturnValue("single"),
      });
      mockFetchImplementation(ERROR_STATE.VERIFY);

      render(<EmployeeOnboarding user={mockUser} />);
      checkTextToBeInDocument("Testuser's Employee Onboarding.");

      await doGenerateProof("SingleUserData");
      await checkTextToBeInDocumentAsync(
        "The blood test failed onboarding requirements."
      );
    });

    test("handles error state when fetching data onstart fails", async () => {
      jest.useFakeTimers();
      mockFetchImplementation(ERROR_STATE.FETCH);

      render(<EmployeeOnboarding user={mockUser} />);
      checkTextToBeInDocument("Testuser's Employee Onboarding.");

      await checkTextToBeInDocumentAsync("Failed to Fetch Data");

      act(() => {
        jest.advanceTimersByTime(6000);
      });

      await waitFor(() => {
        expect(screen.queryByText("Failed to Fetch Data")).toBe(null);
      });
    });
  });
});
