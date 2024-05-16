/*
 * UpdateKeysService.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created at: December 6th 2023
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
import { IUpdateKeysService } from "@keys/interfaces/KeysServiceInterfaces";
import { APIKey } from "@keys/interfaces/KeysInterface";
import { User } from "@/backend/users/interfaces/UsersInterfaces";
import type { IKeysRepository } from "../interfaces/KeysRepoInterfaces";
import {
  getUserPermissions,
  isValidNameFormat,
  isValidStringLength,
} from "@/backend/users/helpers/UsersHelper";
import { UserAction } from "@/backend/users/constants/UsersConstants";
import { NotifyWSService } from "./NotifyWSService";
import { APIKeyStatus, ApiNameDefault } from "../constants/KeysConstants";
import { UserAPIStatus } from "@/backend/userApis/constants/UserApiConstants";

export class UpdateKeysService implements IUpdateKeysService {
  VALID_STATUS = [APIKeyStatus.Active, APIKeyStatus.Deactive];
  keysRepo: IKeysRepository;
  notifyWSService: NotifyWSService;

  constructor(
    @inject("IKeysRepository") keysRepo: IKeysRepository,
    @inject("NotifyWSService") notifyWSService: NotifyWSService
  ) {
    this.keysRepo = keysRepo;
    this.notifyWSService = notifyWSService;
  }

  /**
   * Update API Key
   *
   * @param   {User}              loginUser  The admin user who update the key
   * @param   {APIKey}   apiKey     The API Key to be updated
   *
   * @return  {boolean}             Status of updating API Key
   */
  async updateKey(loginUser: User, apiKey: APIKey): Promise<boolean> {
    // login user permission
    this._validatePermission(loginUser);
    // validate api name format
    this._validateApiNameFormat(apiKey.name);
    // get existing api key
    const existingApiKey = await this._getValidExistApiKey(apiKey);
    // validate api key status
    this._validateStatus(apiKey.status, existingApiKey);

    const updatedApiKey: APIKey = {
      ...existingApiKey,
      name: apiKey.name,
      status: apiKey.status,
      lastModifiedBy: loginUser.email,
    };

    const result = await this.keysRepo.updateKey(updatedApiKey);

    await this.notifyWSService.rebuildApiKeyCache();

    return result;
  }

  /**
   * Get valid existing api key
   *
   * @param   {APIKey}   apiKey  The API Key to be validated
   *
   * @return  {APIKey}          The valid existing api key
   * @throws  {Error}           If api key not found
   */
  private async _getValidExistApiKey(apiKey: APIKey): Promise<APIKey> {
    const existingApiKey = await this.keysRepo.findKey(
      apiKey.id,
      apiKey.userId,
      apiKey.key
    );
    if (!existingApiKey) {
      throw new Error("Api Key not found");
    }
    return existingApiKey;
  }

  private _validatePermission(loginUser: User) {
    const permissions = getUserPermissions(loginUser);
    if (!permissions.includes(UserAction.UpdateAPIKey)) {
      throw new Error("Insufficient permission");
    }
  }

  /**
   * Validate api name format
   *
   * @param   {string}  name  The api name to be validated
   *
   * @throws  {Error}         If name format is invalid or length is invalid
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

  /**
   * Validate api key status
   *
   * @param   {APIKeyStatus}  status          The status to be validated
   * @param   {APIKey}        existingApiKey  The existing api key
   *
   * @throws  {Error}                         If status is invalid
   */
  private _validateStatus(status: APIKeyStatus, existingApiKey: APIKey) {
    if (!this.VALID_STATUS.includes(status)) {
      throw new Error("Invalid status target");
    }
    if (
      existingApiKey.user?.status === UserAPIStatus.Deactive &&
      status === APIKeyStatus.Active
    ) {
      throw new Error("Cannot activate API Key when Business user is inactive");
    }
  }
}
decorate(injectable(), UpdateKeysService);
