/*
 * api/login/route.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */

import { cookies } from "next/headers";
import { OPTIONS, POST } from "@/app/api/login/route";
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
    test("returns 200 and sets cookie for valid credentials", async () => {
      const mockRequest = {
        json: jest
          .fn()
          .mockResolvedValue({ username: "testuser", password: "testuser" }),
      } as unknown as Request;

      const mockSetCookie = jest.fn();
      (cookies as jest.Mock).mockReturnValue({
        set: mockSetCookie,
      });

      const response = await POST(mockRequest);

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 200,
        message: "Login successful",
      });
      expect(mockSetCookie).toHaveBeenCalledWith("username", "testuser");
    });

    test("returns 400 for invalid credentials", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          username: "testuser",
          password: "wrongpassword",
        }),
      } as unknown as Request;

      const response = await POST(mockRequest);

      expect(nextRespJsonMock).toHaveBeenCalledWith({
        status: 400,
        message: "Invalid username or password",
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
