/*
 * UsersRequestInterface.ts
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
import { UserRole, UserStatus } from "@users/constants/UsersConstants";

export interface AddUsersRequest {
  email: string;
  name: string;
}
export interface DeleteUsersRequest {
  id: string;
}
export interface FilterUsersPayload {
  status?: UserStatus;
  name?: string;
  email?: string;
  role?: UserRole;
}
export interface FilterUsersRequest {
  filter: FilterUsersPayload | null;
  skip: number;
  take: number;
}
export interface UpdateUsersRequest {
  userId: string;
  status: UserStatus;
  name: string;
}
