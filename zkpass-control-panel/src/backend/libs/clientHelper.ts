/*
 * actions.ts
 * Utility functions for Pagination and others
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: January 12th 2024
 * -----
 * Last Modified: January 19th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   ntejapermana (nugraha.tejapermana@gdplabs.id)
 *
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
import { PaginationDefault } from "@users/constants/UsersConstants";

export function totalRowsToPage(
  totalRows: number,
  totalPerPage: number = PaginationDefault.Take
): number {
  return Math.ceil(totalRows / totalPerPage);
}

export function pageToSkipTake(
  page: number,
  totalPerPage: number = PaginationDefault.Take
): { skip: number; take: number } {
  const skip = (page - 1) * totalPerPage;
  const take = totalPerPage;
  return { skip, take };
}

export function isValidEmailFormat(email: string): boolean {
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
