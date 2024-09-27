/*
 * 01-authentication.test.ts
 *
 * References:
 *    NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { test, expect } from "@playwright/test";
import { doLogin, doLogout, loadHomePage } from "../utils/authentication";
import { FRONTEND_URL } from "../utils/constants";

test.describe("01 - Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await loadHomePage(page);
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    await doLogin(page, "john", "john");

    await expect(page).toHaveURL(`${FRONTEND_URL}/users`);
    await expect(page.locator("body")).toContainText("Welcome john!");
  });

  test("should failed to login with invalid credentials", async ({ page }) => {
    await doLogin(page, "john", "jooooohn");

    await expect(page).toHaveURL(`${FRONTEND_URL}`);
    await expect(page.locator("body")).toContainText(
      "Invalid username or password"
    );
  });

  test("should successfully logout", async ({ page }) => {
    await doLogin(page, "john", "john");

    await doLogout(page);
  });
});
