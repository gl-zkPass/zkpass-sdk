/*
 * UsersHelper.ts
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
import container from "@/backend/inversify.config";
import { User } from "@/backend/users/interfaces/UsersInterfaces";
import { IUsersRepository } from "@users/interfaces/UsersRepoInterfaces";
import {
  PaginationDefault,
  UserAction,
  UserRole,
} from "@users/constants/UsersConstants";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@authConfig";

export async function getLoginUser(): Promise<User | null> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return null;
  }
  const userRepo = container.get<IUsersRepository>("IUsersRepository");
  const user = await userRepo.findUser(session.user?.email);
  return user;
}

export function getUserPermissions(user: User): UserAction[] {
  let permissions: UserAction[] = [];
  switch (user.role) {
    case UserRole.Root:
      permissions = [
        UserAction.CreateUser,
        UserAction.DeleteUser,
        UserAction.UpdateUserData,
        UserAction.ListAPIKey,
        UserAction.CreateAPIKey,
        UserAction.DeleteAPIKey,
        UserAction.UpdateAPIKey,
        UserAction.CreateUserAPI,
        UserAction.DeleteUserAPI,
        UserAction.ListUserAPI,
        UserAction.UpdateUserAPI,
        UserAction.ListAPIKeyUsage,
      ];
      break;

    case UserRole.Admin:
      permissions = [
        UserAction.CreateUser,
        UserAction.DeleteUser,
        UserAction.UpdateUserData,
        UserAction.ListAPIKey,
        UserAction.CreateAPIKey,
        UserAction.DeleteAPIKey,
        UserAction.UpdateAPIKey,
        UserAction.CreateUserAPI,
        UserAction.DeleteUserAPI,
        UserAction.ListUserAPI,
        UserAction.UpdateUserAPI,
        UserAction.ListAPIKeyUsage,
      ];
      break;

    default:
      break;
  }
  return permissions;
}

export function isValidEmailFormat(email: string): boolean {
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidNameFormat(input: string): boolean {
  const regex: RegExp = /^[a-zA-Z0-9_\s-]+$/;
  return regex.test(input);
}

export function isValidStringLength(
  stringToValidate: string,
  min: number,
  max: number
): boolean {
  const length = stringToValidate.length;
  return length >= min && length <= max;
}

export function isInternalEmail(email: string): boolean {
  const internalEmailRegex: RegExp = /@gdplabs.id$/;
  return internalEmailRegex.test(email);
}
