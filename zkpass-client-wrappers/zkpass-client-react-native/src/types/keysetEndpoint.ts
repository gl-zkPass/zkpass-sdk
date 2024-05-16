/*
 * keysetEndpoint.ts
 * Keyset Endpoint Type
 *
 * Authors:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 * Created at: January 17th 2024
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
export type KeysetEndpoint = {
  jku: string;
  kid: string;
};
