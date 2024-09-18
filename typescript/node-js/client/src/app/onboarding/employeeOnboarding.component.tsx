/*
 * employeeOnboarding.component.tsx
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

"use client";

import HeaderBar from "@/components/header";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import * as jwt from "jsonwebtoken";
import { VERIFIER_URL, ISSUER_URL, MYNAMASTE_URL } from "@/utils/constants";

export default function EmployeeOnboarding({
  user,
}: {
  user: string | undefined;
}) {
  const param = useSearchParams();
  const router = useRouter();
  const steps = [
    "Request Employee Onboarding Questionnaires",
    "Request Blood Test Result",
    "Verify Blood Test Result",
  ];
  const [activeStep, setActiveStep] = React.useState(0);
  const [requestedDvr, setRequestedDvr] = React.useState(false);
  const [requestedBloodTest, setRequestedBloodTest] = React.useState(false);
  const [dvr, setDvr] = React.useState("");
  const [activeUserData, setActiveUserData] = React.useState<
    "Blood Test" | "KYC"
  >("Blood Test");
  const [bloodTest, setBloodTest] = React.useState("");
  const [kycResult, setKycResult] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [formatedDvr, setFormatedDvr] = React.useState("<div></div>");
  const [formatedBloodTest, setFormatedBloodTest] =
    React.useState("<div></div>");
  const [formatedKycResult, setFormatedKycResult] =
    React.useState("<div></div>");
  const [confirmDvr, setConfirmDvr] = React.useState(false);
  const [confirmUserData, setConfirmUserData] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("Loading...");
  const [proofResult, setProofResult] = React.useState(false);
  const [loadedProof, setLoadedProof] = React.useState(false);
  const isUsingMultipleUserData = param.get("user-data") === "multiple";

  if (!user) {
    router.push("/");
  }

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const dvrUrl = `${VERIFIER_URL}/dvrs`;
      const bloodTestUrl = `${ISSUER_URL}/blood_tests`;
      const kycResultUrl = `${ISSUER_URL}/kyc`;
      const fetchingDvrBody = isUsingMultipleUserData
        ? { name: user, multiple: true }
        : { name: user };

      const fetchingDvr = await fetch(dvrUrl, {
        method: "POST",
        body: JSON.stringify(fetchingDvrBody),
      });
      const fetchingBloodTest = await fetch(bloodTestUrl, {
        method: "POST",
        body: JSON.stringify({ name: user }),
      });
      const fetchingKycResult = await fetch(kycResultUrl, {
        method: "POST",
        body: JSON.stringify({ name: user }),
      });

      interface FetchResponse {
        status: number;
        message?: string;
        data?: string;
      }

      Promise.all([fetchingDvr, fetchingBloodTest, fetchingKycResult])
        .then((responses) =>
          Promise.all(responses.map(async (response) => await response.json()))
        )
        .then(([dvrResult, bloodTestResult, kycResult]) => {
          let dvrFetchResponse = dvrResult as FetchResponse;
          let bloodTestFetchResponse = bloodTestResult as FetchResponse;
          let kycResultResponse = kycResult as FetchResponse;
          if (
            dvrFetchResponse.status == 200 &&
            bloodTestFetchResponse.status == 200 &&
            kycResultResponse.status == 200 &&
            dvrFetchResponse.data &&
            bloodTestFetchResponse.data &&
            kycResultResponse.data
          ) {
            setDvr(dvrFetchResponse.data);
            _getDvrPayload(dvrFetchResponse.data);

            setBloodTest(bloodTestFetchResponse.data);
            _getBloodTestPayload(bloodTestFetchResponse.data);

            setKycResult(kycResultResponse.data);
            _getKycPayload(kycResultResponse.data);

            setIsLoading(false);
            setRequestedDvr(true);
            setRequestedBloodTest(true);
            setActiveStep(2);
          } else {
            showError(ErrorMessage.FETCH);
          }
        })
        .catch((error) => showError(error.message));
    })();
  }, []);

  const showError = (message: string) => {
    setMessage(message);
    setOpen(true);
  };

  enum ErrorMessage {
    DVR = "Parsing Error on DVR",
    BLOOD_TEST = "Parsing Error on Blood Test User Data",
    KYC = "Parsing Error on KYC User Data",
    FETCH = "Failed to Fetch Data",
  }
  const decodePayload = (jwtString: string) => {
    const payload = jwt.decode(jwtString, { complete: true })?.payload;
    console.log({ dvrJwtPayload: payload });
    return payload;
  };

  const _getDvrPayload = (dvrJwt: string) => {
    const payload = decodePayload(dvrJwt);
    if (payload == undefined) {
      throw new Error(ErrorMessage.DVR);
    }

    interface DvrPayload {
      data: {
        query: string;
        [key: string]: any;
      };
    }
    const DvrPayload = payload as unknown as DvrPayload;
    DvrPayload.data.query = JSON.parse(DvrPayload.data.query);
    const formatedDvr = JSON.stringify(DvrPayload, null, 2);
    setFormatedDvr(formatedDvr);
  };

  const _getBloodTestPayload = (bloodTestJwt: string) => {
    const payload = decodePayload(bloodTestJwt);
    if (payload == undefined) {
      throw new Error(ErrorMessage.BLOOD_TEST);
    }

    const formatedBloodTest = JSON.stringify(payload, null, 2);
    setFormatedBloodTest(formatedBloodTest);
  };

  const _getKycPayload = (kycJwt: string) => {
    const payload = decodePayload(kycJwt);
    if (payload == undefined) {
      throw new Error(ErrorMessage.KYC);
    }

    const formatedKycResult = JSON.stringify(payload, null, 2);
    setFormatedKycResult(formatedKycResult);
  };

  const _formatUsername = (input: string): string => {
    return input.charAt(0).toUpperCase() + input.slice(1);
  };

  const _viewUserData = () => {
    switch (activeUserData) {
      case "Blood Test":
        return formatedBloodTest;
      case "KYC":
        return formatedKycResult;
    }
  };

  const _handleGenerateProof = async () => {
    setConfirmUserData(true);
    setIsLoading(true);
    setLoadingMessage("Generating Proof...");

    interface ProofResponse {
      status: number;
      message?: string;
      data?: string;
    }
    const body = isUsingMultipleUserData
      ? { dvr, blood_test: bloodTest, kyc: kycResult }
      : { dvr, blood_test: bloodTest };

    const url = `${MYNAMASTE_URL}/api/proofs`;
    const proof = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const proofBody: ProofResponse = await proof.json();
    console.log({ proof: proofBody.data });

    if (proofBody.status == 200) {
      console.log("== proof body 200");
      const validateProof = await fetch(`${VERIFIER_URL}/proofs`, {
        method: "POST",
        body: JSON.stringify({ proof: proofBody.data }),
      });

      interface ProofResult {
        status: number;
        data: {
          output: {
            result: boolean;
          };
        };
      }
      const validateProofBody: ProofResult = await validateProof.json();
      console.log({ validateProofBody });

      if (validateProofBody.status == 200) {
        console.log("== validate proof body 200");
        setProofResult(validateProofBody.data.output.result);
      } else {
        console.log("== validate proof body not 200");
        setProofResult(false);
      }

      setLoadedProof(true);
      setIsLoading(false);
      setActiveStep(3);
    } else {
      console.log("== proof body not 200");

      setIsLoading(false);
      showError(proofBody.message!);
    }
  };

  return (
    <>
      <HeaderBar user={user} />
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        message={message}
      />
      <div className='flex flex-col justify-start items-center h-screen pt-8'>
        <Paper
          elevation={3}
          className='w-3/5 p-7 flex flex-col items-center gap-5'
        >
          {user && (
            <div className='flex items-center text-lg'>
              {_formatUsername(user)}'s Employee Onboarding.
            </div>
          )}

          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: {
                optional?: React.ReactNode;
              } = {};
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>

          {loadedProof && proofResult && (
            <Paper
              elevation={2}
              className='flex flex-row items-center gap-2 p-4 bg-green-200'
            >
              <CheckCircleOutlineIcon
                sx={{ color: "rgb(74 222 128)" }}
                fontSize='large'
              />
              The blood test {isUsingMultipleUserData ? "and kyc" : ""}{" "}
              succeeded onboarding requirements.
            </Paper>
          )}
          {loadedProof && !proofResult && (
            <Paper
              elevation={2}
              className='flex flex-row items-center gap-2 p-4 bg-red-200'
            >
              <CancelIcon sx={{ color: "rgb(248 113 113)" }} fontSize='large' />
              The blood test {isUsingMultipleUserData ? "and/or kyc" : ""}{" "}
              failed onboarding requirements.
            </Paper>
          )}

          {loadedProof && (
            <Button
              className='text-center block'
              href='/users'
              variant='outlined'
            >
              Back to Home
            </Button>
          )}

          {isLoading && (
            <div className='flex flex-col justify-center items-center gap-4'>
              <Box sx={{ display: "flex" }}>
                <CircularProgress />
              </Box>
              <div>{loadingMessage}</div>
            </div>
          )}

          {!confirmUserData && requestedDvr && requestedBloodTest && (
            <Paper
              elevation={2}
              className='p-6 flex items-center flex-col gap-4 bg-gray-200'
            >
              {!confirmUserData && !confirmDvr && (
                <>
                  <div className='text-base'>
                    Please review the Employee Onboarding questionnaires
                  </div>
                  <Paper
                    elevation={1}
                    className='max-h-96 max-w-lg overflow-scroll p-5'
                  >
                    <pre dangerouslySetInnerHTML={{ __html: formatedDvr }} />
                  </Paper>
                  <Button
                    variant='outlined'
                    onClick={() => setConfirmDvr(true)}
                  >
                    Confirm and Continue
                  </Button>
                </>
              )}

              {confirmDvr && !confirmUserData && (
                <>
                  <div className='text-base'>
                    Please review the {activeUserData} Result
                  </div>
                  <Paper elevation={1} className='max-h-96 overflow-scroll p-5'>
                    <pre
                      dangerouslySetInnerHTML={{ __html: _viewUserData() }}
                    />
                  </Paper>
                  {isUsingMultipleUserData && (
                    <div className='flex w-full gap-4'>
                      <Button
                        variant={
                          activeUserData == "Blood Test"
                            ? "outlined"
                            : "contained"
                        }
                        color='info'
                        className='grow'
                        onClick={() => setActiveUserData("Blood Test")}
                      >
                        View Blood_Test Data
                      </Button>
                      <Button
                        variant={
                          activeUserData == "KYC" ? "outlined" : "contained"
                        }
                        color='info'
                        className='grow'
                        onClick={() => setActiveUserData("KYC")}
                      >
                        View KYC Data
                      </Button>
                    </div>
                  )}
                  <Button variant='outlined' onClick={_handleGenerateProof}>
                    Confirm and Generate Proof
                  </Button>
                </>
              )}
            </Paper>
          )}
        </Paper>
      </div>
    </>
  );
}
