/*
 * zkPassApiKey.ts
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: December 27th 2023
 * -----
 * Last Modified: December 27th 2023
 * Modified By: GDPWinnerPranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

export class ZkPassApiKey {
  constructor(readonly apiKey: string, readonly secretApiKey: string) {}

  getApiToken() {
    const formattedApiKey = `${this.apiKey}:${this.secretApiKey}`;
    return Buffer.from(formattedApiKey).toString("base64");
  }
}
