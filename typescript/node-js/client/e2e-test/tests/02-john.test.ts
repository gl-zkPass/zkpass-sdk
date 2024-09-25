/*
 * 02-john.test.ts
 *
 * References:
 *    NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { test } from "@playwright/test";
import { doLogin, loadHomePage } from "../utils/authentication";
import {
  clickConfirmAndContinue,
  clickConfirmAndGenerateProof,
  viewBloodTestData,
  viewKycData,
} from "../utils/navigation";
import {
  clickStartButton,
  shouldVerificationSucceed,
} from "../utils/onboarding";
import { UserDataType } from "../utils/constants";

test.describe("02 - John Scenario", () => {
  test.beforeEach(async ({ page }) => {
    await loadHomePage(page);
    await doLogin(page, "john", "john");
  });

  test("Single User Data - Should verification succeed", async ({ page }) => {
    const userDataType: UserDataType = "SINGLE_USER_DATA";

    await clickStartButton(page, userDataType);
    await clickConfirmAndContinue(page);
    await clickConfirmAndGenerateProof(page);
    await shouldVerificationSucceed(page, userDataType);
  });

  test("Multiple User Data - Should verification succeed", async ({ page }) => {
    const userDataType: UserDataType = "MULTIPLE_USER_DATA";

    await clickStartButton(page, userDataType);
    await clickConfirmAndContinue(page);

    await viewKycData(page);
    await viewBloodTestData(page);

    await clickConfirmAndGenerateProof(page);
    await shouldVerificationSucceed(page, userDataType);
  });
});
