/*
 * KeysInterface.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created at: December 6th 2023
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
import { APIKeyStatus } from "@keys/constants/KeysConstants";
import { UserApi } from "@prisma/client";

export interface APIKey {
  id: number;
  key: string;
  secretKey: string;
  name: string;
  userId: number;
  user?: UserApi;
  status: APIKeyStatus;
  createdBy: string;
  createdAt: Date;
  lastModifiedBy: string;
  lastModifiedAt: Date;
}
