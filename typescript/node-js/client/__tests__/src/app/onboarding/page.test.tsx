/*
 * onboarding/page.tsx
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { cookies } from "next/headers";
import Users from "@/app/onboarding/page";
import { checkTextToBeInDocument } from "../../../test-utils/checks";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue("multiple"),
  }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Onboarding Page", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders EmployeeOnboarding with user when cookie is present", () => {
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ name: "username", value: "testuser" }),
    });

    render(<Users />);
    checkTextToBeInDocument("Testuser's Employee Onboarding.");
  });

  test("renders EmployeeOnboarding without user when cookie is not present", () => {
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(undefined),
    });

    render(<Users />);
    expect(
      screen.queryByText("Testuser's Employee Onboarding.")
    ).not.toBeInTheDocument();
  });
});
