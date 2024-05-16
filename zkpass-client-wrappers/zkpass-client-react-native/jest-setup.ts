/*
 * jest-setup.ts
 *
 * Authors:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: November 28th 2023
 * -----
 * Last Modified: November 30th 2023
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import '@testing-library/jest-native';
import '@testing-library/jest-native/extend-expect';

beforeAll(() => {
  jest.useFakeTimers();
});
afterAll(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

afterEach(() => {
  jest.clearAllTimers();
});
