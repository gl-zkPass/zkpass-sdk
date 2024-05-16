/*
 * ListUserApiService.ts
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
import { injectable, decorate, inject } from "inversify";
import { IListUserApiService } from "../interfaces/UserApiServiceInterfaces";
import { User } from "@/backend/users/interfaces/UsersInterfaces";
import { UserAPI } from "../interfaces/UserApiInterface";
import { FilterUserApisPayload } from "@/backend/requests/UserApisRequestInterface";
import { UserAction } from "@/backend/users/constants/UsersConstants";
import type { IUserApiRepository } from "../interfaces/UserApiRepoInterface";
import { getUserPermissions } from "@/backend/users/helpers/UsersHelper";
import { PaginationDefault } from "../constants/UserApiConstants";

export class ListUserApiService implements IListUserApiService {
  userApiRepo: IUserApiRepository;
  constructor(@inject("IUserApiRepository") userApiRepo: IUserApiRepository) {
    this.userApiRepo = userApiRepo;
  }

  /**
   * List User API
   * @param   {User}     loginUser                       The admin user who list the key
   * @param   {FilterUserApisPayload | null}  filter     Filter list of User API
   * @param   {number}   skip                            Skip/Offset
   * @param   {number}   take                            Take/Limit
   *
   * @return  {{ userApis: UserAPI[]; total: number }}  List of User API and total count
   */
  async listUserApis(
    loginUser: User,
    filter: FilterUserApisPayload | null,
    skip: number = PaginationDefault.Skip,
    take: number = PaginationDefault.Take
  ): Promise<{ userApis: UserAPI[]; total: number }> {
    this._validatePermission(loginUser);
    const userApis = await this.userApiRepo.listUserApis(filter, skip, take);
    return userApis;
  }

  /**
   * Validate whether the user has permission to list User API
   *
   * @param   {User}  loginUser  The admin user who list the key
   *
   * @throws  {Error}            If the user has no permission
   */
  private _validatePermission(loginUser: User) {
    const permissions = getUserPermissions(loginUser);
    if (!permissions.includes(UserAction.ListUserAPI)) {
      throw new Error("Insufficient permission");
    }
  }
}
decorate(injectable(), ListUserApiService);
