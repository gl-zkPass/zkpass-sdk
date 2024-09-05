/*
 * header.test.tsx
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HeaderBar from "../../../src/components/header";
import { useRouter } from "next/navigation";
import { MYNAMASTE_URL } from "@/utils/constants";

// Mock the useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock the fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("HeaderBar", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders header without user", () => {
    render(<HeaderBar user={undefined} />);
    expect(screen.getByText("My Namaste")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  test("renders with user", () => {
    render(<HeaderBar user='testuser' />);
    expect(screen.getByText("My Namaste")).toBeInTheDocument();
    expect(screen.getByText("Logout: testuser")).toBeInTheDocument();
  });

  describe("Logout", () => {
    function doLogout() {
      render(<HeaderBar user='testuser' />);
      const logoutButton = screen.getByText("Logout: testuser");
      fireEvent.click(logoutButton);

      expect(fetch).toHaveBeenCalledWith(`${MYNAMASTE_URL}/api/logout`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    }

    test("handles logout", async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ status: 200, message: "Logged out" }),
      });
      doLogout();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });

    test("handles error on logout", async () => {
      mockFetch.mockResolvedValueOnce({
        status: 400,
        json: () => Promise.reject({ status: 400, message: "Some Error" }),
      });
      doLogout();

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalledWith("/");
      });
    });
  });
});
