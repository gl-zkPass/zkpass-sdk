/*
 * ResourcesHelper.ts
 * Helper functions to be used on Resources
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: January 11th 2024
 * -----
 * Last Modified: January 19th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   ntejapermana (nugraha.tejapermana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */

export function isValidDateString(dateString: string): boolean {
  const parsedDate = new Date(dateString);
  return !isNaN(parsedDate.getTime());
}

export function isValidDateRange(
  startDateString: string,
  endDateString: string
): boolean {
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);

  return startDate <= endDate;
}
