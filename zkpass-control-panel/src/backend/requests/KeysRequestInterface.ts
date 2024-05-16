/*
 * KeysRequestInterface.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: December 6th 2023
 * -----
 * Last Modified: December 6th 2023
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   NONE
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { APIKeyStatus } from "@keys/constants/KeysConstants";

export interface AddKeysRequest {
  userId: string;
}
export interface DeleteKeysRequest {
  id: string;
}
export interface FilterKeysPayload {
  status: APIKeyStatus;
  apiKeyName: string;
  email: string;
}
export interface FilterKeysRequest {
  filter: FilterKeysPayload | null;
}
export interface UpdateKeysRequest {
  apiKeyId: string;
  status: APIKeyStatus;
  businessName: string;
}
