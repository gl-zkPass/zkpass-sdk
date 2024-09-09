/*
 * page.test.tsx
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */

import React, { act } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import Home from "@/app/page";
import { MYNAMASTE_URL } from "@/utils/constants";
import { checkTextToBeInDocument } from "../../test-utils/checks";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Home", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly", () => {
    render(<Home />);
    checkTextToBeInDocument("zkPass Demo : My Namaste");
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByTestId("page-login-btn")).toBeInTheDocument();
  });

  test("shows error message for empty username or password and handle close", async () => {
    jest.useFakeTimers();

    render(<Home />);
    fireEvent.click(screen.getByTestId("page-login-btn"));
    checkTextToBeInDocument("Username or password cannot be empty");

    act(() => {
      jest.advanceTimersByTime(6000);
    });

    await waitFor(() => {
      expect(screen.queryByText("Username or password cannot be empty")).toBe(
        null
      );
    });
  });

  test("Handle keyDown Enter on password field", async () => {
    render(<Home />);
    fireEvent.keyDown(screen.getByLabelText("Password"), {
      key: "Enter",
      code: "Enter",
    });

    checkTextToBeInDocument("Username or password cannot be empty");
  });

  test("Handle keyDown do nothing on password field", async () => {
    render(<Home />);
    fireEvent.keyDown(screen.getByLabelText("Password"), {
      key: "shift",
      code: "shift",
    });

    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  test("handles login successfully", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ status: 200, message: "Success" }),
    });

    render(<Home />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password" },
    });
    fireEvent.keyDown(screen.getByLabelText("Password"), {
      key: "Enter",
      code: "Enter",
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`${MYNAMASTE_URL}/api/login`, {
        method: "POST",
        body: JSON.stringify({ username: "testuser", password: "password" }),
      });
      expect(mockPush).toHaveBeenCalledWith("/users");
    });
  });

  test("shows error message when fetch status is not 200", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ status: 404, message: "Credentials not Found" }),
    });

    render(<Home />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByTestId("page-login-btn"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`${MYNAMASTE_URL}/api/login`, {
        method: "POST",
        body: JSON.stringify({ username: "testuser", password: "password" }),
      });
      checkTextToBeInDocument("Credentials not Found");
    });
  });

  test("shows error message when error raised", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => Promise.reject("Some Error Raised"),
    });

    render(<Home />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByTestId("page-login-btn"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`${MYNAMASTE_URL}/api/login`, {
        method: "POST",
        body: JSON.stringify({ username: "testuser", password: "password" }),
      });
      expect(screen.queryByText("Some Error Raised")).toBe(null);
    });
  });
});
