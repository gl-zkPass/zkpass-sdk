/*
 * UserApiServiceInterface.ts
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
import { User } from "@/backend/users/interfaces/UsersInterfaces";
import { UserAPI } from "./UserApiInterface";
import { FilterUserApisPayload } from "@/backend/requests/UserApisRequestInterface";

export interface IAddUserApiService {
  /**
   * Add new User API
   *
   * @param   {User}     loginUser  The admin user who add the key
   * @param   {UserAPI}  userApi    The User API to be added
   *
   * @return  {number}              The ID of the added User API
   */
  addUserApi(loginUser: User, userApi: UserAPI): Promise<number>;
}

export interface IDeleteUserApiService {
  /**
   * Delete User API
   *
   * @param   {User}     loginUser  The admin user who delete the key
   * @param   {UserAPI}  userApi    The User API to be deleted
   *
   * @return  {boolean}             Status of deleting User API
   */
  deleteUserApi(loginUser: User, userApi: UserAPI): Promise<boolean>;
}

export interface IListUserApiService {
  /**
   * List User API
   * @param   {User}     loginUser                       The admin user who list the key
   * @param   {FilterUserApisPayload | null}  filter     Filter list of User API
   * @param   {number}   skip                            Skip/Offset
   * @param   {number}   take                            Take/Limit
   *
   * @return  {{ userApis: UserAPI[]; total: number }}  List of User API and total count
   */
  listUserApis(
    loginUser: User,
    filter: FilterUserApisPayload | null,
    skip: number,
    take: number
  ): Promise<{ userApis: UserAPI[]; total: number }>;
}

export interface IUpdateUserApiService {
  /**
   * Update User API
   *
   * @param   {User}     loginUser  The admin user who update the key
   * @param   {UserAPI}  userApi    The User API to be updated
   *
   * @return  {boolean}             Status of updating User API
   */
  updateUserApis(loginUser: User, userApi: UserAPI): Promise<boolean>;
}
