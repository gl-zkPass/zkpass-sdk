import * as jose from "jose";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { signDataToJwsToken } from "zkpass-client-ts";

const PRIVATE_KEY_PEM =
  "-----BEGIN PRIVATE KEY-----\n" +
  "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQglp8yytUIEmLwvS4C\n" +
  "VoNdq/ZoMr8r62NNpahRLs3Qz1ChRANCAATLbp6ZyQBJdpuqTuzNu6PICiQ+RoH7\n" +
  "OCpNtkldFWXbaBH8y7yVnz7tzFlnfsklwfmBp0S55BwmNoDRdOUde3U5\n" +
  "-----END PRIVATE KEY-----\n";

const MOCK_PRIVATE_KEY_PEM =
  "-----BEGIN PRIVATE KEY-----\n" +
  "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3J/wAlzSD8ZyAU8f\n" +
  "bPkuCY/BSlq2Y2S5hym8sRccpZehRANCAATt/RChVSxxwH3IzAcBHuhWT8v5mRfx\n" +
  "moLVnRdNqPcExwyeqH5XN0dlffIYprf66E0CEpZbJ8H+v7cTys9Ie1dd\n" +
  "-----END PRIVATE KEY-----\n";

const ASSET_PATH = "public/issuer/";

interface BloodTest {
  testId: string;
  lab: {
    ID: string;
  };
  subject: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  };
  measuredPanelsNgML: {
    cocaine: string;
  };
  [key: string]: any;
}

export async function POST(req: Request) {
  console.log("*** POST issuer/blood_tests ***");

  const { name } = await req.json();
  const userName = name;

  const usersFilePath = path.join(
    process.cwd(),
    ASSET_PATH,
    "blood-tests.json"
  );
  const usersFileContents = fs.readFileSync(usersFilePath, "utf8");
  const bloodTests: { [key: string]: BloodTest } =
    JSON.parse(usersFileContents);

  if (!bloodTests[userName]) {
    return Response.json({
      status: 400,
      message: `Blood test for ${userName} is not found`,
    });
  }

  const bloodTest = bloodTests[userName];

  // const kid = "7wpN4uGns0IXN5rD8GJKgx2qVuUBuAfhzJbnUWW7rQg";
  // const alg = "ES256";

  // const privateKey = await jose.importPKCS8(PRIVATE_KEY_PEM, alg);

  // const jwt = await new jose.SignJWT(bloodTest)
  //   .setProtectedHeader({ alg, kid })
  //   .setIssuedAt()
  //   .setIssuer("zkpass:issuer")
  //   .setAudience("zkpass:audience")
  //   .setExpirationTime("2h")
  //   .sign(privateKey);
  const jwt = await _signBloodTest(bloodTest);

  console.log("=== blood_test jwt sent ===");
  return _setHeader(NextResponse.json({ status: 200, data: jwt }));
}

export async function GET() {
  return NextResponse.json({ data: "get api blood_tests" });
}

export async function OPTION() {
  let response = _setHeader(NextResponse.json({ status: 200 }));
  return response;
}

async function _signBloodTest(data: { [key: string]: any }) {
  const verifyingKeyJKWS = {
    jku: process.env.NEXT_PUBLIC_URL + "/issuer/jwks.json",
    kid: "7wpN4uGns0IXN5rD8GJKgx2qVuUBuAfhzJbnUWW7rQg",
  };
  const mockVerifyingKeyJKWS = {
    jku: "https://raw.githubusercontent.com/zulamdat/zulamdat.github.io/sample-key/zkp-key/issuer-key.json",
    kid: "k-1",
  };

  const signedBloodTest = await signDataToJwsToken(
    PRIVATE_KEY_PEM,
    data,
    verifyingKeyJKWS
  );
  const mockSignedBloodTest = await signDataToJwsToken(
    MOCK_PRIVATE_KEY_PEM,
    data,
    mockVerifyingKeyJKWS
  );
  // return signedBloodTest;
  return mockSignedBloodTest;
}

function _setHeader(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}
