/*
 * 03-jane.test.ts
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
  shouldVerificationFailed,
} from "../utils/onboarding";
import { UserDataType } from "../utils/constants";

test.describe("03 - Jane Scenario", () => {
  test.beforeEach(async ({ page }) => {
    await loadHomePage(page);
    await doLogin(page, "jane", "jane");
  });

  test("Single User Data - Should verification fail", async ({ page }) => {
    const userDataType: UserDataType = "SINGLE_USER_DATA";

    await clickStartButton(page, userDataType);
    await clickConfirmAndContinue(page);
    await clickConfirmAndGenerateProof(page);
    await shouldVerificationFailed(page, userDataType);
  });

  test("Multiple User Data - Should verification fail", async ({ page }) => {
    const userDataType: UserDataType = "MULTIPLE_USER_DATA";

    await clickStartButton(page, userDataType);
    await clickConfirmAndContinue(page);

    await viewKycData(page);
    await viewBloodTestData(page);

    await clickConfirmAndGenerateProof(page);
    await shouldVerificationFailed(page, userDataType);
  });
});
