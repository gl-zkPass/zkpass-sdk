/*
 * UpdateUserApiService.ts
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created at: December 15th 2023
 * -----
 * Last Modified: January 19th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   handrianalandi (handrian.alandi@gdplabs.id)
 *   ntejapermana (nugraha.tejapermana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { injectable, decorate, inject } from "inversify";
import { IUpdateUserApiService } from "../interfaces/UserApiServiceInterfaces";
import { User } from "@/backend/users/interfaces/UsersInterfaces";
import { UserAPI } from "../interfaces/UserApiInterface";
import type { IUserApiRepository } from "../interfaces/UserApiRepoInterface";
import {
  getUserPermissions,
  isValidNameFormat,
  isValidStringLength,
} from "@/backend/users/helpers/UsersHelper";
import { UserAction } from "@/backend/users/constants/UsersConstants";
import { UserApiNameDefault } from "../constants/UserApiConstants";

export class UpdateUserApiService implements IUpdateUserApiService {
  userApiRepo: IUserApiRepository;
  constructor(@inject("IUserApiRepository") userApiRepo: IUserApiRepository) {
    this.userApiRepo = userApiRepo;
  }

  /**
   * Update User API
   *
   * @param   {User}     loginUser  The admin user who update the key
   * @param   {UserAPI}  userApi    The User API to be updated
   *
   * @return  {boolean}             Status of updating User API
   */
  async updateUserApis(loginUser: User, userApi: UserAPI): Promise<boolean> {
    // login user permission
    this._validatePermission(loginUser);
    // validate UserApi name format
    this._validateUserApiNameFormat(userApi.name);
    //
    const existingUserApi = await this._getValidExistUserApi(userApi);

    const updatedUserApi: UserAPI = {
      ...existingUserApi,
      email: userApi.email,
      name: userApi.name,
      lastModifiedBy: loginUser.email,
      status: userApi.status,
    };

    const result = await this.userApiRepo.updateUserApi(updatedUserApi);
    return result;
  }

  /**
   * Validate whether User Api Id exists
   *
   * @param   {UserAPI}  userApi  The User API to be validated
   *
   * @throws  {Error}             If User Api Id does not exist
   */
  private async _getValidExistUserApi(userApi: UserAPI): Promise<UserAPI> {
    const existingApiKey = await this.userApiRepo.findUserApiById(userApi.id);
    if (!existingApiKey) {
      throw new Error("Business user not found");
    }
    return existingApiKey;
  }

  /**
   * Validate permission
   *
   * @param   {User}  loginUser  The login user
   *
   * @throws  {Error}            If user does not have permission
   */
  private _validatePermission(loginUser: User) {
    const permissions = getUserPermissions(loginUser);
    if (!permissions.includes(UserAction.UpdateUserAPI)) {
      throw new Error("Insufficient permission");
    }
  }

  /**
   * Validate User Api name format
   *
   * @param   {string}  name  The User Api name to be validated
   *
   * @throws  {Error}         If User Api name format is invalid or length is invalid
   */
  private _validateUserApiNameFormat(name: string) {
    if (!isValidNameFormat(name)) {
      throw new Error("Invalid name format");
    }
    if (
      !isValidStringLength(
        name,
        UserApiNameDefault.MinLength,
        UserApiNameDefault.MaxLength
      )
    ) {
      throw new Error(
        `Invalid name length, must be between ${UserApiNameDefault.MinLength} and ${UserApiNameDefault.MaxLength} characters`
      );
    }
  }
}
decorate(injectable(), UpdateUserApiService);
