/*
 * keys.ts
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: March 5th 2024
 * -----
 * Last Modified: March 5th 2024
 * Modified By: GDPWinnerPranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

export function zkPassPubToSpki(key: { x: string; y: string }) {
  return (
    "-----BEGIN PUBLIC KEY-----\n" +
    key.x +
    "\n" +
    key.y +
    "\n-----END PUBLIC KEY-----"
  );
}
