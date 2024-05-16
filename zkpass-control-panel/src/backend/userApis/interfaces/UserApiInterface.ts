/*
 * UserApiInterface.ts
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

import { UserAPIStatus } from "../constants/UserApiConstants";

export interface UserAPI {
  id: number;
  email: string;
  name: string;
  status: UserAPIStatus;
  createdAt: Date;
  lastModifiedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}
