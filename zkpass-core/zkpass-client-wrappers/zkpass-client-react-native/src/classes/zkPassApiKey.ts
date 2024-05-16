/*
 * zkPassApiKey.ts
 * zkPassApiKey class
 *
 * Authors:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 * Created at: January 15th 2024
 * -----
 * Last Modified: January 17th 2024
 * Modified By: handrianalandi (handrian.alandi@gdplabs.id)
 * -----
 * Reviewers:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   JaniceLaksana (janice.laksana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
export class ZkPassApiKey {
  constructor(readonly apiKey: string, readonly secretApiKey: string) {}

  getApiToken() {
    const formattedApiKey = `${this.apiKey}:${this.secretApiKey}`;
    return Buffer.from(formattedApiKey).toString('base64');
  }
}
