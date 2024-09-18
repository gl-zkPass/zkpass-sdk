/*
 * layout.test.tsx
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */

import React from "react";
import { render } from "@testing-library/react";
import RootLayout from "@/app/layout";

jest.mock("next/font/google", () => ({
  Inter: () => ({
    className: "mocked-inter",
  }),
}));

describe("RootLayout", () => {
  test("renders correctly", () => {
    const { container } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );

    // Verify the html element has the correct lang attribute
    const htmlElement = container.querySelector("html");
    expect(htmlElement).toHaveAttribute("lang", "en");

    // Verify the body element has the correct class name
    const bodyElement = container.querySelector("body");
    expect(bodyElement).toHaveClass("mocked-inter");

    // Verify the children are rendered correctly
    expect(container).toHaveTextContent("Test Child");
  });
});
