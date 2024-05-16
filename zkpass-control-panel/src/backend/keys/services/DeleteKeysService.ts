/*
 * DeleteKeysService.ts
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
import { IDeleteKeysService } from "@keys/interfaces/KeysServiceInterfaces";
import { APIKey } from "@keys/interfaces/KeysInterface";
import type { IKeysRepository } from "../interfaces/KeysRepoInterfaces";
import { User } from "@/backend/users/interfaces/UsersInterfaces";
import { getUserPermissions } from "@/backend/users/helpers/UsersHelper";
import { UserAction } from "@/backend/users/constants/UsersConstants";
import { NotifyWSService } from "./NotifyWSService";

export class DeleteKeysService implements IDeleteKeysService {
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
   * Delete API Key
   *
   * @param   {User}              loginUser  The admin user who delete the key
   * @param   {APIKey}   apiKey     The API Key to be deleted
   *
   * @return  {boolean}             Status of deleting API Key
   */
  async deleteKey(loginUser: User, apiKey: APIKey): Promise<boolean> {
    // login user permission
    this._validatePermission(loginUser);
    // validate whether Apikey Id exists
    this._validateApiKeyExists(apiKey);
    //
    const result = await this.keysRepo.deleteKey(apiKey);

    await this.notifyWSService.rebuildApiKeyCache();

    return result;
  }

  /**
   * Validate whether Apikey Id exists
   *
   * @param   {APIKey}    apiKey  The API Key to be validated
   *
   * @throws  {Error}             If Apikey Id does not exist
   */
  private async _validateApiKeyExists(apiKey: APIKey) {
    const isUserExist = await this.keysRepo.findKey(
      apiKey.id,
      apiKey.userId,
      apiKey.key
    );
    if (!isUserExist) {
      throw new Error("User does not exist");
    }
  }

  /**
   * Validate permission
   *
   * @param   {User}  loginUser  The login user
   *
   * @throws  {Error}            If login user has insufficient permission
   */
  private _validatePermission(loginUser: User) {
    const permissions = getUserPermissions(loginUser);
    if (!permissions.includes(UserAction.DeleteUserAPI)) {
      throw new Error("Insufficient permission");
    }
  }
}
decorate(injectable(), DeleteKeysService);
