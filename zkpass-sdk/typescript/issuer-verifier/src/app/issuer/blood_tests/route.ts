import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { ZkPassClient } from "@didpass/zkpass-client-ts";

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

  const jwt = await _signBloodTest(bloodTest);

  console.log("=== blood_test jwt sent ===");
  return _setHeader(NextResponse.json({ status: 200, data: jwt }));
}

export async function GET() {
  return NextResponse.json({ data: "get api blood_tests" });
}

export async function OPTIONS() {
  let response = _setHeader(NextResponse.json({ status: 200 }));
  return response;
}

async function _signBloodTest(data: { [key: string]: any }) {
  /**
   * Step 1
   * Provide private key to sign data
   */
  const PRIVATE_KEY_PEM =
    "-----BEGIN PRIVATE KEY-----\n" +
    "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3J/wAlzSD8ZyAU8f\n" +
    "bPkuCY/BSlq2Y2S5hym8sRccpZehRANCAATt/RChVSxxwH3IzAcBHuhWT8v5mRfx\n" +
    "moLVnRdNqPcExwyeqH5XN0dlffIYprf66E0CEpZbJ8H+v7cTys9Ie1dd\n" +
    "-----END PRIVATE KEY-----\n";

  /**
   * Step 2
   * Provide url containing jwks, and kid of the jwks
   * This is the pair of the private key from step 1
   */
  const verifyingKeyJKWS = {
    jku: "https://gdp-admin.github.io/zkpass-sdk/zkpass/sample-jwks/issuer-key.json",
    kid: "k-1",
  };

  /**
   * Step 3
   * Sign data to jws token
   */
  const zkPassClient = new ZkPassClient();
  const signedBloodTest = await zkPassClient.signDataToJwsToken(
    PRIVATE_KEY_PEM,
    data,
    verifyingKeyJKWS
  );

  return signedBloodTest;
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
