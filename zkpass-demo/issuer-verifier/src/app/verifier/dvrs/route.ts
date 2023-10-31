import * as jose from "jose";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { exec } from "child_process";
import { signDataToJwsToken } from "zkpass-client-ts";

const PRIVATE_KEY_PEM =
  "-----BEGIN PRIVATE KEY-----\n" +
  "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg5id+/cVk6kmj3dM7\n" +
  "alwP77XUmhQb/W4wtHVsBtjhSAOhRANCAATro+vBiHB3a0cO4J0l1GHJVitGas2w\n" +
  "+K+wfnV1/3aCBlgDXS883XmznpgRhiiHD5oel26PqDZ5U5YiW48NDLhG\n" +
  "-----END PRIVATE KEY-----\n";
const MOCK_PRIVATE_KEY_PEM =
  "-----BEGIN PRIVATE KEY-----\n" +
  "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C\n" +
  "EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh\n" +
  "PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4\n" +
  "-----END PRIVATE KEY-----\n";

const ASSET_PATH = "public/verifier/";

interface User {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export async function POST(req: Request) {
  console.log("*** POST verifier/dvrs ***");

  const { name } = await req.json();
  const userName = name;

  const usersFilePath = path.join(process.cwd(), ASSET_PATH, "users.json");
  const usersFileContents = fs.readFileSync(usersFilePath, "utf8");
  const users: { [key: string]: User } = JSON.parse(usersFileContents);

  if (!users[userName]) {
    return Response.json({
      status: 400,
      message: `User ${userName} not found`,
    });
  }

  const user = users[userName];

  const dvrQuery = _generateBloodTestQuery(user);

  // const kid = "PhE7UwNG7wskhKX9Qb71DAlXyM6a-Bcy5kHQLH1c3VY";
  // const alg = "ES256";

  // const privateKey = await jose.importPKCS8(PRIVATE_KEY_PEM, alg);

  // const jwt = await new jose.SignJWT(dvr)
  //   .setProtectedHeader({ alg, kid })
  //   .setIssuedAt()
  //   .setIssuer("zkpass:issuer")
  //   .setAudience("zkpass:audience")
  //   .setExpirationTime("2h")
  //   .sign(privateKey);

  const data = {
    dvr_title: "Onboarding Blood Test",
    dvr_id: "obbt",
    user_data_url: "http://localhost:3000/verifier",
    query_engine_ver: "1.0.2",
    query_method_ver: "12122121",
    query: dvrQuery,
  };

  const jwt = await _signDVR(data);

  console.log("=== dvr sent ===");
  return _setHeader(NextResponse.json({ status: 200, data: jwt }));
}

export async function GET() {
  return Response.json({ data: "get api dvrs" });
}

export async function OPTION() {
  let response = _setHeader(NextResponse.json({ status: 200 }));
  return response;
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

async function _signDVR(data: { [key: string]: any }) {
  const verifyingKeyJKWS = {
    jku: process.env.NEXT_PUBLIC_URL + "/verifier/jwks.json",
    kid: "PhE7UwNG7wskhKX9Qb71DAlXyM6a-Bcy5kHQLH1c3VY",
  };
  const mockVerifyingKeyJKWS = {
    jku: "https://raw.githubusercontent.com/zulamdat/zulamdat.github.io/sample-key/zkp-key/verifier-key.json",
    kid: "k-1",
  };
  data["user_data_verifying_key"] = {
    KeysetEndpoint: verifyingKeyJKWS,
  };
  const signedDVR = await signDataToJwsToken(
    PRIVATE_KEY_PEM,
    data,
    verifyingKeyJKWS
  );
  const mockSignedDVR = await signDataToJwsToken(
    MOCK_PRIVATE_KEY_PEM,
    data,
    mockVerifyingKeyJKWS
  );
  // return signedDVR;
  return mockSignedDVR;
}

function _generateBloodTestQuery(user: User): string {
  const query = {
    and: [
      {
        "==": ["lab.ID", "QH801874"],
      },
      {
        "==": ["testID", "SCREEN-7083-12345"],
      },
      {
        "~==": ["subject.firstName", user.firstName],
      },
      {
        "~==": ["subject.lastName", user.lastName],
      },
      {
        "==": ["subject.dateOfBirth", user.dateOfBirth],
      },
      {
        "<=": ["measuredPanelsNgML.cocaine", 10],
      },
    ],
  };

  return JSON.stringify(query);
}
