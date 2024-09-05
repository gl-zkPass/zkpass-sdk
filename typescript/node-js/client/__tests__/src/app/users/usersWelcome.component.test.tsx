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

    expect(screen.getByText("Welcome testuser!")).toBeInTheDocument();
    expect(
      screen.getByText("Start Employee Onboarding (Single User Data)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Start Employee Onboarding (Multiple User Data)")
    ).toBeInTheDocument();
  });

  test("redirects to home when user is not defined", () => {
    render(<UsersWelcome user={undefined} />);
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
