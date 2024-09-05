/*
 * users/page.tsx
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { cookies } from "next/headers";
import Users from "@/app/users/page";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
}));

describe("Users Page", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders UsersWelcome with user when cookie is present", () => {
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ name: "username", value: "testuser" }),
    });
    render(<Users />);

    expect(screen.getByText("Welcome testuser!")).toBeInTheDocument();
  });

  test("renders UsersWelcome without user when cookie is not present", () => {
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(undefined),
    });
    render(<Users />);

    expect(screen.queryByText("Welcome testuser!")).not.toBeInTheDocument();
  });
});
