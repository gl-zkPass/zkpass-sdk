/*
 * ListKeysService.ts
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
import { IListKeysService } from "@keys/interfaces/KeysServiceInterfaces";
import { APIKey } from "@keys/interfaces/KeysInterface";
import { FilterKeysPayload } from "@/backend/requests/KeysRequestInterface";
import { User } from "@/backend/users/interfaces/UsersInterfaces";
import { UserAction } from "@/backend/users/constants/UsersConstants";
import type { IKeysRepository } from "../interfaces/KeysRepoInterfaces";
import { getUserPermissions } from "@/backend/users/helpers/UsersHelper";
import { PaginationDefault } from "../constants/KeysConstants";

export class ListKeysService implements IListKeysService {
  keyRepo: IKeysRepository;
  constructor(@inject("IKeysRepository") keyRepo: IKeysRepository) {
    this.keyRepo = keyRepo;
  }

  /**
   * List API Keys
   * @param   {User}                      loginUser  The admin user who list the key
   * @param   {FilterKeysPayload | null}  filter     Filter list of API Keys
   * @param   {number}                    skip       Skip/Offset
   * @param   {number}                    take       Take/Limit
   *
   * @return  {{ apiKeys: APIKey[]; total: number }}  List of API Keys and total count
   */
  async listKeys(
    loginUser: User,
    filter: FilterKeysPayload | null,
    skip: number = PaginationDefault.Skip,
    take: number = PaginationDefault.Take
  ): Promise<{ apiKeys: APIKey[]; total: number }> {
    this._validatePermission(loginUser);
    const listOfKeys = await this.keyRepo.listKeys(filter, skip, take);
    return listOfKeys;
  }

  /**
   * Validate whether the user has permission to list API Keys
   *
   * @param   {User}  loginUser  The admin user who list the key
   *
   * @throws  {Error}            If the user has no permission
   */
  private _validatePermission(loginUser: User) {
    const permissions = getUserPermissions(loginUser);
    if (!permissions.includes(UserAction.ListAPIKey)) {
      throw new Error("Insufficient permission");
    }
  }
}
decorate(injectable(), ListKeysService);
