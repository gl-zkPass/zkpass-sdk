/*
 * page.tsx
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home component", () => {
  test("renders the correct text", () => {
    render(<Home />);
    const textElement = screen.getByText(/Issuer-Verifier demo is running./i);
    expect(textElement).toBeInTheDocument();
  });
});
