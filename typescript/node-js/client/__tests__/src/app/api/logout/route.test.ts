/*
 * api/logout/route.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */

import { POST, OPTIONS } from "@/app/api/logout/route";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: jest.fn(),
}));

describe("route.ts", () => {
  const nextRespSetMock = jest.fn();
  const nextRespJsonMock = jest.fn().mockReturnValue({
    headers: {
      set: nextRespSetMock,
    },
  });

  beforeEach(() => {
    (NextResponse.json as jest.Mock) = nextRespJsonMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    test("deletes the username cookie and returns 200 status", async () => {
      const mockDeleteCookie = jest.fn();
      (cookies as jest.Mock).mockReturnValue({
        delete: mockDeleteCookie,
      });

      const mockRequest = {} as Request;
      const response = await POST(mockRequest);

      expect(mockDeleteCookie).toHaveBeenCalledWith("username");
      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 200,
        message: "Logout successful",
      });
    });
  });

  describe("OPTIONS", () => {
    test("returns 200 and sets correct headers", async () => {
      const response = await OPTIONS();
      expect(nextRespJsonMock).toHaveBeenCalledWith({ status: 200 });

      expect(nextRespSetMock).toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "*"
      );
      expect(nextRespSetMock).toHaveBeenCalledWith(
        "Access-Control-Allow-Methods",
        "POST, GET, OPTIONS"
      );
      expect(nextRespSetMock).toHaveBeenCalledWith(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
    });
  });
});
