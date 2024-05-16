/*
 * route.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: January 19th 2024
 * -----
 * Last Modified: January 19th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 *   handrianalandi (handrian.alandi@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   ntejapermana (nugraha.tejapermana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
import { StatusCodes } from "http-status-codes";

export async function GET(_: Request) {
  return new Response("OK", {
    status: StatusCodes.OK,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
