/*
 * AddKeysService.ts
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
import { injectable, decorate, inject } from "inversify";
import { IAddKeysService } from "@keys/interfaces/KeysServiceInterfaces";
import { APIKey } from "@keys/interfaces/KeysInterface";
import { User } from "@/backend/users/interfaces/UsersInterfaces";
import { UserAction, UserRole } from "@/backend/users/constants/UsersConstants";
import type { IKeysRepository } from "../interfaces/KeysRepoInterfaces";
import type { IUserApiRepository } from "@/backend/userApis/interfaces/UserApiRepoInterface";
import { NotifyWSService } from "./NotifyWSService";
import {
  getUserPermissions,
  isValidEmailFormat,
  isValidNameFormat,
  isValidStringLength,
} from "@/backend/users/helpers/UsersHelper";
import { UserAPI } from "@/backend/userApis/interfaces/UserApiInterface";
import { UserAPIStatus } from "@/backend/userApis/constants/UserApiConstants";
import { v4 } from "uuid";
import { ApiNameDefault } from "../constants/KeysConstants";

export class AddKeysService implements IAddKeysService {
  VALID_ROLES = [UserRole.Admin, UserRole.Root];
  userApiRepo: IUserApiRepository;
  keysRepo: IKeysRepository;
  notifyWSService: NotifyWSService;

  constructor(
    @inject("IUserApiRepository") userApiRepo: IUserApiRepository,
    @inject("IKeysRepository") keysRepo: IKeysRepository,
    @inject("NotifyWSService") notifyWSService: NotifyWSService
  ) {
    this.userApiRepo = userApiRepo;
    this.keysRepo = keysRepo;
    this.notifyWSService = notifyWSService;
  }

  /**
   * Add new API Key
   *
   * @param   {User}    loginUser  The admin user who add the key
   * @param   {APIKey}  apiKey     The API Key to be added
   * @param   {string}  email      The email of the user who will use the API Key
   *
   * @return  {boolean}  Status of adding API Key
   */
  async addKey(
    loginUser: User,
    apiKey: APIKey,
    email: string
  ): Promise<boolean> {
    // validate login user permission
    this._validatePermission(loginUser);
    // validate email format
    this._validateEmailFormat(email);
    // validate api name format
    this._validateApiNameFormat(apiKey.name);
    // validate whether user Id exists
    let userApi = await this.userApiRepo.findUserApi(email);
    // validate whether user api activate / not
    this._validateActiveUser(userApi);
    //
    apiKey.userId = userApi?.id || 0;
    apiKey.key = v4();
    apiKey.secretKey = v4();
    const result = await this.keysRepo.addKey(loginUser, apiKey, email);

    await this.notifyWSService.rebuildApiKeyCache();

    return result;
  }

  /**
   * Validate login user permission
   *
   * @param   {User}         loginUser  The login user
   *
   * @throws  {Error}                    If login user has insufficient permission
   */
  private _validatePermission(loginUser: User) {
    const permissions = getUserPermissions(loginUser);
    if (!permissions.includes(UserAction.CreateAPIKey)) {
      throw new Error("Insufficient permission");
    }
    if (!permissions.includes(UserAction.CreateUserAPI)) {
      throw new Error("Insufficient permission");
    }
  }

  /**
   * Validate whether user api activate / not
   *
   * @param   {UserAPI}  userApi  The user api
   *
   * @throws  {Error}             If user api is not active or not found
   */
  private _validateActiveUser(userApi: UserAPI | null) {
    if (userApi && userApi.status === UserAPIStatus.Deactive) {
      throw new Error("Business user is deactivated");
    }
  }

  /**
   * Validate email format
   *
   * @param   {string}  email  The email
   *
   * @throws  {Error}          If email is not in correct format
   */
  private _validateEmailFormat(email: string) {
    const isEmailValid = isValidEmailFormat(email);
    if (!isEmailValid) {
      throw new Error("Email is not in correct format");
    }
  }

  /**
   * Validate api name format
   *
   * @param   {string}  name  The name
   *
   * @throws  {Error}         If name is not in correct format
   */
  private _validateApiNameFormat(name: string) {
    if (!isValidNameFormat(name)) {
      throw new Error("Invalid name format");
    }
    if (
      !isValidStringLength(
        name,
        ApiNameDefault.MinLength,
        ApiNameDefault.MaxLength
      )
    ) {
      throw new Error(
        `Invalid name length, must be between ${ApiNameDefault.MinLength} and ${ApiNameDefault.MaxLength} characters`
      );
    }
  }
}
decorate(injectable(), AddKeysService);
