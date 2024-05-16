/*
 * KeysServiceInterfaces.ts
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

export interface IAddKeysService {
  /**
   * Add new API Key
   *
   * @param   {User}    loginUser  The admin user who add the key
   * @param   {APIKey}  apiKey     The API Key to be added
   * @param   {string}  email      The email of the user who will use the API Key
   *
   * @return  {boolean}  Status of adding API Key
   */
  addKey(loginUser: User, apiKey: APIKey, email: string): Promise<boolean>;
}

export interface IDeleteKeysService {
  /**
   * Delete API Key
   *
   * @param   {User}              loginUser  The admin user who delete the key
   * @param   {APIKey}   apiKey     The API Key to be deleted
   *
   * @return  {boolean}             Status of deleting API Key
   */
  deleteKey(loginUser: User, apiKey: APIKey): Promise<boolean>;
}

export interface IListKeysService {
  /**
   * List API Keys
   * @param   {User}                      loginUser  The admin user who list the key
   * @param   {FilterKeysPayload | null}  filter     Filter list of API Keys
   * @param   {number}                    skip       Skip/Offset
   * @param   {number}                    take       Take/Limit
   *
   * @return  {{ apiKeys: APIKey[]; total: number }}  List of API Keys and total count
   */
  listKeys(
    loginUser: User,
    filter: FilterKeysPayload | null,
    skip: number,
    take: number
  ): Promise<{ apiKeys: APIKey[]; total: number }>;
}

export interface IUpdateKeysService {
  /**
   * Update API Key
   *
   * @param   {User}              loginUser  The admin user who update the key
   * @param   {APIKey}   apiKey     The API Key to be updated
   *
   * @return  {boolean}             Status of updating API Key
   */
  updateKey(loginUser: User, apiKey: APIKey): Promise<boolean>;
}
