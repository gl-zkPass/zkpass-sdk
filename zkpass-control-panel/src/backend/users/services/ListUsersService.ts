/*
 * ListUsersService.ts
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
import { injectable, decorate, inject } from "inversify";
import { User } from "@users/interfaces/UsersInterfaces";
import { IListUsersService } from "@users/interfaces/UsersServicesInterfaces";
import { FilterUsersPayload } from "@/backend/requests/UsersRequestInterface";
import type { IUsersRepository } from "@users/interfaces/UsersRepoInterfaces";
import { PaginationDefault, UserAction } from "@users/constants/UsersConstants";
import { getUserPermissions } from "@users/helpers/UsersHelper";

export class ListUsersService implements IListUsersService {
  userRepo: IUsersRepository;
  constructor(@inject("IUsersRepository") userRepo: IUsersRepository) {
    this.userRepo = userRepo;
  }

  /**
   * List Users
   *
   * @param   {User}                      loginUser  The admin user who list the key
   * @param   {FilterUsersPayload | null}  filter     Filter list of Users
   * @param   {number}                    skip       Skip/Offset
   * @param   {number}                    take       Take/Limit
   *
   * @return  {{ users: User[]; total: number }}  List of Users and total count
   */
  async listUsers(
    loginUser: User,
    filter: FilterUsersPayload | null,
    skip: number = PaginationDefault.Skip,
    take: number = PaginationDefault.Take
  ): Promise<{ users: User[]; total: number }> {
    this._validatePermission(loginUser);
    const { users, total } = await this.userRepo.listUsers(filter, skip, take);
    return { users, total };
  }

  /**
   * Validate whether the user has permission to list Users
   *
   * @param   {User}  loginUser  The admin user who list the key
   *
   * @throws  {Error}            Insufficient permission
   */
  private _validatePermission(loginUser: User) {
    const permissions = getUserPermissions(loginUser);
    if (!permissions.includes(UserAction.ListAPIKey)) {
      throw new Error("Insufficient permission");
    }
  }
}
decorate(injectable(), ListUsersService);
