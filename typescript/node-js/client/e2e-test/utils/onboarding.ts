/*
 * onboarding.tsx
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { Page, expect } from "@playwright/test";
import { goToHome } from "./navigation";
import { PROOF_GENERATION_TIMEOUT, UserDataType } from "./constants";

const shouldHaveOnboardingTexts = async (page: Page) => {
  const body = page.locator("body");
  await expect(body).toContainText(
    "Request Employee Onboarding Questionnaires"
  );
  await expect(body).toContainText("Request Blood Test Result");
  await expect(body).toContainText("Verify Blood Test Result");

  await expect(body).toContainText(
    "Please review the Employee Onboarding questionnaires"
  );
};

export const clickStartButton = async (page: Page, type: UserDataType) => {
  if (type === "SINGLE_USER_DATA") {
    await page
      .locator("a", { hasText: "Start Employee Onboarding (Single User Data)" })
      .click();
  } else {
    await page
      .locator("a", {
        hasText: "Start Employee Onboarding (Multiple User Data)",
      })
      .click();
  }
  await shouldHaveOnboardingTexts(page);
};

export const shouldVerificationSucceed = async (
  page: Page,
  type: UserDataType
) => {
  if (type === "SINGLE_USER_DATA") {
    await page.waitForSelector(
      "text=The blood test succeeded onboarding requirements.",
      { timeout: PROOF_GENERATION_TIMEOUT }
    );
  } else {
    await page.waitForSelector(
      "text=The blood test and kyc succeeded onboarding requirements.",
      { timeout: PROOF_GENERATION_TIMEOUT }
    );
  }
  await goToHome(page);
};

export const shouldVerificationFailed = async (
  page: Page,
  type: UserDataType
) => {
  if (type === "SINGLE_USER_DATA") {
    await page.waitForSelector(
      "text=The blood test failed onboarding requirements.",
      { timeout: PROOF_GENERATION_TIMEOUT }
    );
  } else {
    await page.waitForSelector(
      "text=The blood test and/or kyc failed onboarding requirements.",
      { timeout: PROOF_GENERATION_TIMEOUT }
    );
  }
  await goToHome(page);
};
