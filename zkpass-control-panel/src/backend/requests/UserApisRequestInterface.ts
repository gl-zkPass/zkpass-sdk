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
import { UserAPIStatus } from "../userApis/constants/UserApiConstants";

export interface AddKeysRequest {
  userId: string;
}
export interface DeleteKeysRequest {
  id: string;
}
export interface FilterUserApisPayload {
  status: UserAPIStatus;
  email: string;
  name: string;
}
export interface FilterKeysRequest {
  filter: FilterUserApisPayload | null;
}
export interface UpdateKeysRequest {
  apiKeyId: string;
  status: UserAPIStatus;
  businessName: string;
}
