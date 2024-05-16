/*
 * UsersInterfaces.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: December 6th 2023
 * -----
 * Last Modified: December 14th 2023
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { UserRole, UserStatus } from "@users/constants/UsersConstants";

export interface User {
  id: number;
  email: string;
  name: string;
  status: UserStatus;
  role: UserRole;
  createdAt: Date;
  lastModifiedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}
