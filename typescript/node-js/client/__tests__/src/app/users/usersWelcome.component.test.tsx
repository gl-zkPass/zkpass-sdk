/*
 * users/usersWelcome.component.tsx
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import UsersWelcome from "@/app/users/usersWelcome.component";
import { checkTextToBeInDocument } from "../../../test-utils/checks";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("UsersWelcome", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly with user", () => {
    render(<UsersWelcome user='testuser' />);

    checkTextToBeInDocument("Welcome testuser!");
    checkTextToBeInDocument("Start Employee Onboarding (Single User Data)");
    checkTextToBeInDocument("Start Employee Onboarding (Multiple User Data)");
  });

  test("redirects to home when user is not defined", () => {
    render(<UsersWelcome user={undefined} />);
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
