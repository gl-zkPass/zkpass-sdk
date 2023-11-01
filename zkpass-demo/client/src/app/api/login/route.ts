import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  console.log("POST /api/login");
  const { username, password } = await req.json();
  if (username != password) {
    console.log("Invalid username or password");
    return Response.json({
      status: 400,
      message: "Invalid username or password",
    });
  }
  cookies().set("username", (username as string).toLowerCase());
  return Response.json({ status: 200, message: "Login successful" });
}

export async function OPTIONS() {
  let response = NextResponse.json({ status: 200 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}
