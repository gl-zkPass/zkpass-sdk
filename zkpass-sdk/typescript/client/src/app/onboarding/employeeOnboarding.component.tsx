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
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import * as jwt from "jsonwebtoken";

export default function EmployeeOnboarding({
  user,
}: {
  user: string | undefined;
}) {
  const router = useRouter();
  const steps = [
    "Request Employee Onboarding Questionnaires",
    "Request Blood Test Result",
    "Verify Blood Test Result",
  ];
  const [activeStep, setActiveStep] = React.useState(0);
  const [requestedDVR, setRequestedDVR] = React.useState(false);
  const [requestedBloodTest, setRequestedBloodTest] = React.useState(false);
  const [dvr, setDVR] = React.useState("");
  const [bloodTest, setBloodTest] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [formatedDVR, setFormatedDVR] = React.useState("<div></div>");
  const [formatedBloodTest, setFormatedBloodTest] =
    React.useState("<div></div>");
  const [confirmDVR, setConfirmDVR] = React.useState(false);
  const [confirmBloodTest, setConfirmBloodTest] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("Loading...");
  const [proofResult, setProofResult] = React.useState(false);
  const [loadedProof, setLoadedProof] = React.useState(false);

  if (!user) {
    router.push("/");
  }

  useEffect(() => {
    console.log({ dvr, bloodTest });
  }, [dvr, bloodTest]);

  useEffect(() => {
    if (!requestedDVR || !requestedBloodTest) {
      setIsLoading(true);
      const dvrUrl = "http://localhost:3001/verifier/dvrs";
      const bloodTestUrl = "http://localhost:3001/issuer/blood_tests";
      const fetchingDvr = fetch(dvrUrl, {
        method: "POST",
        body: JSON.stringify({ name: user }),
      });
      const fetchingBloodTest = fetch(bloodTestUrl, {
        method: "POST",
        body: JSON.stringify({ name: user }),
      });
      interface FetchResponse {
        status: number;
        message?: string;
        data?: string;
      }

      Promise.all([fetchingDvr, fetchingBloodTest])
        .then((responses) =>
          Promise.all(responses.map((response) => response.json()))
        )
        .then(([dvrResult, bloodTestResult]) => {
          let dvrFetchResponse = dvrResult as FetchResponse;
          let bloodTestFetchResponse = bloodTestResult as FetchResponse;
          if (
            dvrFetchResponse.status == 200 &&
            bloodTestFetchResponse.status == 200
          ) {
            setDVR(dvrResult.data as string);
            _getDVRPayload(dvrResult.data as string);
            setBloodTest(bloodTestResult.data as string);
            _getBloodTestPayload(bloodTestResult.data as string);
            setIsLoading(false);
            setRequestedDVR(true);
            setRequestedBloodTest(true);
            setActiveStep(2);
          } else {
            const message =
              dvrFetchResponse.message || bloodTestFetchResponse.message;
            setMessage(message as string);
            setOpen(true);
          }
        })
        .catch((error) => console.error(error));
    }
  }, []);

  const _getDVRPayload = async (dvrJwt: string) => {
    console.log("_getDVRPayload before if");

    if (dvrJwt.length === 0) {
      return;
    }
    console.log("_getDVRPayload");

    const payload = jwt.decode(dvrJwt, { complete: true })?.payload;
    console.log({ dvrJwtPayload: payload });
    interface DVRPayload {
      data: {
        query: string;
        [key: string]: any;
      };
    }
    const DVRPayload = payload as unknown as DVRPayload;
    DVRPayload.data.query = JSON.parse(DVRPayload.data.query);
    const formatedDVR = JSON.stringify(DVRPayload, null, 2);
    setFormatedDVR(formatedDVR);
  };
  const _getBloodTestPayload = async (bloodTestJwt: string) => {
    if (bloodTestJwt.length === 0) {
      return;
    }
    const payload = jwt.decode(bloodTestJwt, { complete: true })?.payload;
    console.log({ bloodTestJwtPayload: payload });

    const formatedBloodTest = JSON.stringify(payload, null, 2);
    setFormatedBloodTest(formatedBloodTest);
  };

  const _formatUsername = (input: string): string => {
    if (input.length === 0) {
      return input;
    }
    return input.charAt(0).toUpperCase() + input.slice(1);
  };

  const _handleGenerateProof = async () => {
    setConfirmBloodTest(true);
    setIsLoading(true);
    setLoadingMessage("Generating Proof...");
    const url = "http://localhost:3000/api/proofs";
    interface ProofResponse {
      status: number;
      message?: string;
      data?: string;
    }
    const proof = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ dvr, blood_test: bloodTest }),
    });
    const proofBody: ProofResponse = await proof.json();
    console.log({ proof: proofBody.data });
    if (proofBody.status == 200) {
      console.log("== proof body 200");
      const validateProof = await fetch(
        "http://localhost:3001/verifier/proofs",
        {
          method: "POST",
          body: JSON.stringify({ proof: proofBody.data }),
        }
      );
      interface ProofResult {
        status: number;
        data: boolean;
      }
      const validateProofBody: ProofResult = await validateProof.json();
      console.log({ validateProofBody });

      if (validateProofBody.status == 200) {
        console.log("== validate proof body 200");
        setProofResult(validateProofBody.data);
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
      setOpen(true);
      setMessage(proofBody.message as string);
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
      <div className="flex flex-col justify-start items-center h-screen pt-8">
        <Paper
          elevation={3}
          className="w-3/5 p-7 flex flex-col items-center gap-5"
        >
          <div className="flex items-center text-lg">
            {_formatUsername(user!)}'s Employee Onboarding.
          </div>
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
          {loadedProof && proofResult ? (
            <Paper
              elevation={2}
              className="flex flex-row items-center gap-2 p-4 bg-green-200"
            >
              <CheckCircleOutlineIcon
                sx={{ color: "rgb(74 222 128)" }}
                fontSize="large"
              />
              Blood test fulfiled onboarding requirements
            </Paper>
          ) : loadedProof && !proofResult ? (
            <Paper
              elevation={2}
              className="flex flex-row items-center gap-2 p-4 bg-red-200"
            >
              <CancelIcon sx={{ color: "rgb(248 113 113)" }} fontSize="large" />
              Blood test failed onboarding requirements
            </Paper>
          ) : (
            <></>
          )}

          {isLoading ? (
            <div className="flex flex-col justify-center items-center gap-4">
              <Box sx={{ display: "flex" }}>
                <CircularProgress />
              </Box>
              <div>{loadingMessage}</div>
            </div>
          ) : (
            <></>
          )}

          {!confirmBloodTest && requestedDVR && requestedBloodTest ? (
            <Paper
              elevation={2}
              className="p-6 flex items-center flex-col gap-4 bg-gray-200"
            >
              {!confirmBloodTest && !confirmDVR ? (
                <>
                  <div className="text-base">
                    Please review the Employee Onboarding questionnaires
                  </div>
                  <Paper
                    elevation={1}
                    className="max-h-96 max-w-lg overflow-scroll p-5"
                  >
                    <pre dangerouslySetInnerHTML={{ __html: formatedDVR }} />
                  </Paper>
                  <Button
                    variant="outlined"
                    onClick={() => setConfirmDVR(true)}
                  >
                    Confirm and Continue
                  </Button>
                </>
              ) : (
                <></>
              )}

              {confirmDVR && !confirmBloodTest ? (
                <>
                  <div className="text-base">
                    Please review the Blood Test Result
                  </div>
                  <Paper elevation={1} className="max-h-96 overflow-scroll p-5">
                    <pre
                      dangerouslySetInnerHTML={{ __html: formatedBloodTest }}
                    />
                  </Paper>
                  <Button variant="outlined" onClick={_handleGenerateProof}>
                    Confirm and Generate Proof
                  </Button>
                </>
              ) : (
                <></>
              )}
            </Paper>
          ) : (
            <></>
          )}
        </Paper>
      </div>
    </>
  );
}
