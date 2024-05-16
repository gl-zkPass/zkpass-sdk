/*
 * UserApiRepoInterface.ts
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
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

import { User } from "@/backend/users/interfaces/UsersInterfaces";
import { UserAPI } from "./UserApiInterface";
import { FilterUserApisPayload } from "@/backend/requests/UserApisRequestInterface";
import { UserApi } from "@prisma/client";

export interface IUserApiRepository {
  /**
   * Add new User API
   *
   * @param   {User}     loginUser  The admin user who add the key
   * @param   {UserAPI}  userApi    The User API to be added
   *
   * @return  {number}              The ID of the added User API
   */
  addUserApi(loginUser: User, userApi: UserAPI): Promise<number>;
  /**
   * Find User API by email
   *
   * @param   {string}   email  The email of the user
   *
   * @return  {UserAPI | null}  The User API or null if not found
   */
  findUserApi(email: string): Promise<UserAPI | null>;
  /**
   * Find User API by id
   *
   * @param   {number<UserAPI>}   id  The id of the user
   *
   * @return  {UserAPI | null}      The User API or null if not found
   */
  findUserApiById(id: number): Promise<UserAPI | null>;
  /**
   * List User APIs
   *
   * @param   {FilterUserApisPayload}  filter  The filter
   * @param   {number}                 skip    The skip
   * @param   {number}                 take    The take
   *
   * @return  {{ userApis: UserAPI[]; total: number }}  List of User APIs and total count
   */
  listUserApis(
    filter: FilterUserApisPayload | null,
    skip?: number,
    limit?: number
  ): Promise<{ userApis: UserAPI[]; total: number }>;
  /**
   * Delete User API
   *
   * @param   {UserAPI<boolean>}  userApi  The User API to be deleted
   *
   * @return  {boolean}                    Deletion status
   */
  deleteUserApi(userApi: UserAPI): Promise<boolean>;
  /**
   * Update User API
   *
   * @param   {UserAPI}  userApi  The User API to be updated
   *
   * @return  {boolean}           Update status
   */
  updateUserApi(userApi: UserAPI): Promise<boolean>;
  /**
   * List UserApi by Given Api Keys
   *
   * @param   {string[]}  apiKeys List of API Keys
   *
   * @return  { APIKey[] }  All of listed API Keys
   */
  listUserApiByApiKeys(apiKeys: string[]): Promise<UserApi[]>;
}
