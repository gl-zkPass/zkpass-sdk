/*
 * UserApiConstants.ts
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created at: December 15th 2023
 * -----
 * Last Modified: December 22nd 2023
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
export enum PlaceholderValue {
  Number = 0,
  String = "",
}
export enum UserAPIStatus {
  None = 0,
  Active = 1,
  Deactive = 2,
}
export enum UserApiNameDefault {
  MinLength = 3,
  MaxLength = 150,
}
export enum PaginationDefault {
  Skip = 0,
  Take = process.env.NODE_ENV == "development" ? 3 : 10,
}
