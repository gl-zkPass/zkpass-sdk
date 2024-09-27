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
  const texts = [
    "Request Employee Onboarding Questionnaires",
    "Request Blood Test Result",
    "Verify Blood Test Result",
    "Please review the Employee Onboarding questionnaires",
  ];

  for (const text of texts) {
    await expect(body).toContainText(text);
  }
};

export const clickStartButton = async (page: Page, type: UserDataType) => {
  const selector =
    type === "SINGLE_USER_DATA"
      ? "a:has-text('Start Employee Onboarding (Single User Data)')"
      : "a:has-text('Start Employee Onboarding (Multiple User Data)')";

  await page.locator(selector).click();
  await shouldHaveOnboardingTexts(page);
};

export const shouldVerificationSucceed = async (
  page: Page,
  type: UserDataType
) => {
  const successText =
    type === "SINGLE_USER_DATA"
      ? "The blood test succeeded onboarding requirements."
      : "The blood test and kyc succeeded onboarding requirements.";

  await page.waitForSelector(`text=${successText}`, {
    timeout: PROOF_GENERATION_TIMEOUT,
  });
  await goToHome(page);
};

export const shouldVerificationFailed = async (
  page: Page,
  type: UserDataType
) => {
  const failureText =
    type === "SINGLE_USER_DATA"
      ? "The blood test failed onboarding requirements."
      : "The blood test and/or kyc failed onboarding requirements.";

  await page.waitForSelector(`text=${failureText}`, {
    timeout: PROOF_GENERATION_TIMEOUT,
  });
  await goToHome(page);
};
