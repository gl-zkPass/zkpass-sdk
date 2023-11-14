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
    "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgln38K+VhuqmDCahN\n" +
    "VFfftgyM7MeY7t6LZqIx+PcPCjOhRANCAASvtotehwDpyUwONiDzQDxWdwaa+uaj\n" +
    "tzi4SPgPtJm5YGsLINywg+uh9MaHTRmVLlgCgIGenyT0Yx6iNmPRo3zb\n" +
    "-----END PRIVATE KEY-----\n";

  /**
   * Step 2
   * Provide url containing jwks, and kid of the jwks
   * This is the pair of the private key from step 1
   */
  const verifyingKeyJKWS = {
    jku: process.env.NEXT_PUBLIC_URL + "/issuer/jwks.json",
    kid: "yibXxdascCcvpCxxbVvRm1B0N2loYIB8wMyGJjr5P0A=",
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
