/*
 * layout.tsx
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { render, screen } from "@testing-library/react";
import RootLayout, { metadata } from "@/app/layout";

jest.mock("next/font/google", () => ({
  Inter: () => ({
    className: "mocked-inter",
  }),
}));

describe("RootLayout component", () => {
  test("renders children correctly", () => {
    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    const childElement = screen.getByText(/Test Child/i);
    expect(childElement).toBeInTheDocument();
  });

  test("renders with correct metadata", () => {
    expect(metadata.title).toBe("zkPass Demo Issuer Verifier");
    expect(metadata.description).toBe("zkPass Demo Issuer Verifier");
  });

  test("renders with correct HTML structure", () => {
    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    const htmlElement = screen.getByRole("document");
    expect(htmlElement).toHaveAttribute("lang", "en");
    const bodyElement = screen.getByText(/Test Child/i).closest("body");
    expect(bodyElement).toHaveClass("mocked-inter");
  });
});
