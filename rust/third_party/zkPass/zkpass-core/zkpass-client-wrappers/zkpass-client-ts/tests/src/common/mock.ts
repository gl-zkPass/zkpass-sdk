/*
 * mock.ts
 * Unit tests for zkPass Client Class.
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: March 8th 2024
 * -----
 * Last Modified: March 8th 2024
 * Modified By: GDPWinnerPranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

export function mockFetchResponse(args: {
  [path: string]: {
    body?: any;
    statusCode: number;
    statusText?: string;
  };
}): jest.Mock {
  return jest.fn((url) => {
    return Object.keys(args).includes(url)
      ? Promise.resolve({
          json: () => Promise.resolve(args[url].body),
          status: args[url].statusCode,
          statusText: args[url].statusText,
        })
      : Promise.reject(new Error(`No mock for ${url}`));
  });
}
