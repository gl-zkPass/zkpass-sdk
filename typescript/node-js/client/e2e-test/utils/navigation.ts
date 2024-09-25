/*
 * navigation.tsx
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { Page, expect } from "@playwright/test";

export const viewBloodTestData = async (page: Page) => {
  await page.locator("button", { hasText: "View Blood_Test Data" }).click();
  await expect(page.locator("body")).toContainText(
    "Please review the Blood Test Result"
  );
};

export const viewKycData = async (page: Page) => {
  await page.locator("button", { hasText: "View KYC Data" }).click();
  await expect(page.locator("body")).toContainText(
    "Please review the KYC Result"
  );
};

export const clickConfirmAndContinue = async (page: Page) => {
  await page.locator("button", { hasText: "Confirm and Continue" }).click();

  await expect(page.locator("body")).toContainText(
    "Please review the Blood Test Result"
  );
};

export const clickConfirmAndGenerateProof = async (page: Page) => {
  await page
    .locator("button", { hasText: "Confirm and Generate Proof" })
    .click();
  await expect(page.locator("body")).toContainText("Generating Proof");
};

export const goToHome = async (page: Page) => {
  const backToHomeButton = page.getByText("Back to Home");
  await expect(backToHomeButton).toBeVisible();
  await backToHomeButton.click();
};
