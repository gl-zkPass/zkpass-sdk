/*
 * authentication.tsx
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { Page, expect } from "@playwright/test";
import { FRONTEND_URL } from "./constants";

const checkHomeComponents = async (page: Page) => {
  await expect(page).toHaveURL(`${FRONTEND_URL}`);
  await expect(page.locator("body")).toContainText("zkPass Demo : My Namaste");
};

export const loadHomePage = async (page: Page) => {
  await page.goto(FRONTEND_URL);
  await checkHomeComponents(page);
};

export const doLogin = async (
  page: Page,
  username: string,
  password: string
) => {
  await page.fill('input[type="text"]', username);
  await page.fill('input[type="password"]', password);

  await page.click('button[type="button"]');
};

export const doLogout = async (page: Page) => {
  await page.locator("a", { hasText: "Logout" }).click();
  await checkHomeComponents(page);
};
