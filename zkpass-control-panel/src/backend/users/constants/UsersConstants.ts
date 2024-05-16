/*
 * UsersConstants.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: December 6th 2023
 * -----
 * Last Modified: January 19th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 *   handrianalandi (handrian.alandi@gdplabs.id)
 *   ntejapermana (nugraha.tejapermana@gdplabs.id)
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

export enum PaginationDefault {
  Skip = 0,
  Take = process.env.NODE_ENV == "development" ? 3 : 10,
}

export enum UserNameDefault {
  MinLength = 3,
  MaxLength = 50,
}

export enum UserStatus {
  None = 0,
  Active = 1,
  Deactive = 2,
}

export enum UserRole {
  None = 0,
  Root = 1,
  Admin = 2,
}

export enum UserAction {
  CreateUser = "Create User",
  DeleteUser = "Delete User",
  UpdateUserData = "Update User Data",
  ListAPIKey = "List API Key",
  CreateAPIKey = "Create API Key",
  DeleteAPIKey = "Delete API Key",
  UpdateAPIKey = "Update API Key",
  ListUserAPI = "List User API",
  CreateUserAPI = "Create User API",
  DeleteUserAPI = "Delete User API",
  UpdateUserAPI = "Update User API",
  ListAPIKeyUsage = "List API Key Usage",
}
