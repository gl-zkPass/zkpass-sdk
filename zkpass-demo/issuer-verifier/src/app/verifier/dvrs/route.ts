import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { signDataToJwsToken } from "zkpass-client-ts";

const PRIVATE_KEY_PEM =
  "-----BEGIN PRIVATE KEY-----\n" +
  "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgoscaQEAjaaBo1WZ3\n" +
  "QYh0QF1bgjq/LF7nelvj8blaxeChRANCAARD9HUmJXTWInD5PYLY1sR4HOiNm+e8\n" +
  "ORtu6YJAO6qFhyuzxyxid3QFJNyanOswNxxbaEwhKxfE+q+jOfKR4pND\n" +
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
    kid: "H3l/puWLF1UF4QHGMlIBvg8DrHax5ECYYjEDMUTeELk=",
  };
  data["user_data_verifying_key"] = {
    KeysetEndpoint: verifyingKeyJKWS,
  };
  const signedDVR = await signDataToJwsToken(
    PRIVATE_KEY_PEM,
    data,
    verifyingKeyJKWS
  );
  return signedDVR;
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
