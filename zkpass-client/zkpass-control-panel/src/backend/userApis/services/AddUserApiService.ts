/*
 * AddUserApiService.ts
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
import { User } from "@/backend/users/interfaces/UsersInterfaces";
import {
  UserAction,
  UserNameDefault,
  UserRole,
} from "@/backend/users/constants/UsersConstants";
import type { IUsersRepository } from "@/backend/users/interfaces/UsersRepoInterfaces";
import {
  getUserPermissions,
  isValidEmailFormat,
  isValidNameFormat,
  isValidStringLength,
} from "@/backend/users/helpers/UsersHelper";
import type { IAddUserApiService } from "../interfaces/UserApiServiceInterfaces";
import type { IUserApiRepository } from "../interfaces/UserApiRepoInterface";
import { UserAPI } from "../interfaces/UserApiInterface";

export class AddUserApiService implements IAddUserApiService {
  VALID_ROLES = [UserRole.Admin, UserRole.Root];
  userRepo: IUsersRepository;
  userApiRepo: IUserApiRepository;

  constructor(
    @inject("IUsersRepository") userRepo: IUsersRepository,
    @inject("IUserApiRepository") userApiRepo: IUserApiRepository
  ) {
    this.userRepo = userRepo;
    this.userApiRepo = userApiRepo;
  }

  /**
   * Add new User API
   *
   * @param   {User}     loginUser  The admin user who add the key
   * @param   {UserAPI}  userApi    The User API to be added
   *
   * @return  {number}              The ID of the added User API
   */
  async addUserApi(loginUser: User, userApi: UserAPI): Promise<number> {
    // validate login user permission
    this._validatePermission(loginUser);
    // validate whether user email exists
    this._validateUserExists(userApi);
    // other validation
    this._validateEmailFormat(userApi);
    this._validateNameFormat(userApi.name);
    //
    const result = await this.userApiRepo.addUserApi(loginUser, userApi);
    return result;
  }

  /**
   * Validate permission
   *
   * @param   {User}         loginUser  The admin user who add the key
   *
   * @throws  {Error}                   If user does not have permission
   */
  private _validatePermission(loginUser: User) {
    const permissions = getUserPermissions(loginUser);
    if (!permissions.includes(UserAction.CreateUserAPI)) {
      throw new Error("Insufficient permission");
    }
  }

  /**
   * Validate user API exists
   *
   * @param   {UserAPI}  userApi  The User API to be validated
   *
   * @throws  {Error}             If user API already exists
   */
  private async _validateUserExists(userApi: UserAPI) {
    const isUserExist = await this.userRepo.findUser(userApi.email);
    if (isUserExist) {
      throw new Error("User already exist");
    }
  }

  /**
   * Validate email format
   *
   * @param   {UserAPI}  userApi  The User API to be validated
   *
   * @throws  {Error}             If email format is invalid
   */
  private _validateEmailFormat(userApi: UserAPI) {
    if (!isValidEmailFormat(userApi.email)) {
      throw new Error("Invalid email format");
    }
  }

  /**
   * Validate name format
   *
   * @param   {string}  name  The name to be validated
   *
   * @throws  {Error}         If name format is invalid or length is invalid
   */
  private _validateNameFormat(name: string) {
    if (!isValidNameFormat(name)) {
      throw new Error("Invalid name format");
    }
    if (
      !isValidStringLength(
        name,
        UserNameDefault.MinLength,
        UserNameDefault.MaxLength
      )
    ) {
      throw new Error(
        `Invalid name length, must be between ${UserNameDefault.MinLength} and ${UserNameDefault.MaxLength} characters`
      );
    }
  }
}
decorate(injectable(), AddUserApiService);
