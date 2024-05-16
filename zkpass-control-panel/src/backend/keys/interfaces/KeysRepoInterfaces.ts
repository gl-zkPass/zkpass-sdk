/*
 * UsersRepoInterfaces.ts
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

import { User } from "@/backend/users/interfaces/UsersInterfaces";
import { APIKey } from "./KeysInterface";
import { FilterKeysPayload } from "@/backend/requests/KeysRequestInterface";

export interface IKeysRepository {
  /**
   * Add new API Key
   *
   * @param   {User}    loginUser  The admin user who add the key
   * @param   {APIKey}  apiKey     The API Key to be added
   * @param   {string}  email      The email of the user who will use the API Key
   *
   * @return  {boolean}  [return description]
   */
  addKey(loginUser: User, apiKey: APIKey, email: string): Promise<boolean>;
  /**
   * List API Keys
   *
   * @param   {FilterKeysPayload | null}  filter  Filter list of API Keys
   * @param   {number}                    skip    Skip/Offset
   * @param   {number}                    take    Take/Limit
   *
   * @return  {{ apiKeys: APIKey[]; total: number }}  List of API Keys and total count
   */
  listKeys(
    filter: FilterKeysPayload | null,
    skip?: number,
    limit?: number
  ): Promise<{ apiKeys: APIKey[]; total: number }>;
  /**
   * Find API Key
   *
   * @param   {number}            id      API Key ID
   * @param   {number}            userId  User ID
   * @param   {string}            key     API Key
   *
   * @return  {APIKey | null}  API Key
   */
  findKey(id: number, userId: number, key: string): Promise<APIKey | null>;
  /**
   * Delete API Key
   *
   * @param   {APIKey}            apiKey  The API Key to be deleted
   *
   * @return  {Promise<boolean>}          Deletion status
   */
  deleteKey(apiKey: APIKey): Promise<boolean>;
  /**
   * Update API Key
   *
   * @param   {APIKey}   apiKey  Updated API Key
   *
   * @return  {boolean}          Update status
   */
  updateKey(apiKey: APIKey): Promise<boolean>;
}
