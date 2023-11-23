import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  ZkPassClient,
  DataVerificationRequest,
} from "@didpass/zkpass-client-ts";
import { v4 as uuidv4 } from "uuid";
import { dvrLookup } from "./dvrHelper";

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

  const jwt = await _generateSignedDVR(user);

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

async function _generateSignedDVR(user: User) {
  const dvrQuery = _generateBloodTestQuery(user);

  /**
   * Step 1
   * Provide private key to sign data
   */
  const PRIVATE_KEY_PEM =
    "-----BEGIN PRIVATE KEY-----\n" +
    "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C\n" +
    "EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh\n" +
    "PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4\n" +
    "-----END PRIVATE KEY-----\n";

  /**
   * Step 2
   * Provide url containing jwks, and kid of the jwks
   * This is the pair of the private key from step 1
   */
  const verifyingKeyJKWS = {
    jku: "https://gdp-admin.github.io/didPass-demo/zkpass/sample-jwks/verifier-key.json",
    kid: "k-1",
  };

  /**
   * Step 3
   * Prepare DVR to sign
   */
  const zkPassClient = new ZkPassClient();
  const { queryEngineVersion, queryMethodVersion } =
    await zkPassClient.getQueryEngineVersionInfo();
  const data = DataVerificationRequest.fromJSON({
    dvr_title: "Onboarding Blood Test",
    dvr_id: uuidv4(),
    query_engine_ver: queryEngineVersion,
    query_method_ver: queryMethodVersion,
    query: dvrQuery,
    user_data_url: "http://localhost:3000/verifier",
    user_data_verifying_key: {
      KeysetEndpoint: verifyingKeyJKWS,
    },
  });

  /**
   * Step 4
   * sign data to jws token
   */
  const signedDVR = await data.signToJwsToken(
    PRIVATE_KEY_PEM,
    verifyingKeyJKWS
  );

  console.log({ DataVerificationRequest: data });
  // This dvrLookup will be used in the proof validation process in proofValidator.ts
  dvrLookup.value.addDVR(data);

  return signedDVR;
}

function _generateBloodTestQuery(user: User): string {
  /**
   * Update this query to match your needs.
   */
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
