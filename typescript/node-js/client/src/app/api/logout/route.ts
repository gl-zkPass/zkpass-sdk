/*
 * route.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  console.log("POST /api/logout");
  cookies().delete("username");
  return NextResponse.json({ status: 200, message: "Logout successful" });
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
