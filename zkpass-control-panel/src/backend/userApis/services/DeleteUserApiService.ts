/*
 * DeleteUserApiService.ts
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
import { IDeleteUserApiService } from "../interfaces/UserApiServiceInterfaces";
import { User } from "@/backend/users/interfaces/UsersInterfaces";
import { UserAPI } from "../interfaces/UserApiInterface";
import type { IUserApiRepository } from "../interfaces/UserApiRepoInterface";
import { getUserPermissions } from "@/backend/users/helpers/UsersHelper";
import { UserAPIStatus } from "../constants/UserApiConstants";
import { UserAction } from "@/backend/users/constants/UsersConstants";

export class DeleteUserApiService implements IDeleteUserApiService {
  userApiRepo: IUserApiRepository;

  constructor(@inject("IUserApiRepository") userApiRepo: IUserApiRepository) {
    this.userApiRepo = userApiRepo;
  }

  /**
   * Delete User API
   *
   * @param   {User}     loginUser  The admin user who delete the key
   * @param   {UserAPI}  userApi    The User API to be deleted
   *
   * @return  {boolean}             Status of deleting User API
   */
  async deleteUserApi(loginUser: User, userApi: UserAPI): Promise<boolean> {
    // login user permission
    this._validatePermission(loginUser);
    // validate whether User Api Id exists
    this._validateUserApiExists(userApi);
    // validate whether User Api is not deleted
    this._validateNotDeleted(userApi);
    //
    const result = await this.userApiRepo.deleteUserApi(userApi);
    return result;
  }

  /**
   * Validate whether User Api Id exists
   *
   * @param   {UserAPI}    userApi  The User API to be validated
   *
   * @throws  {Error}               If User Api Id does not exist
   */
  private async _validateUserApiExists(userApi: UserAPI) {
    const isUserExist = await this.userApiRepo.findUserApi(userApi.email);
    if (!isUserExist) {
      throw new Error("Business user does not exist");
    }
  }

  /**
   * Validate whether User Api is not deleted
   *
   * @param   {UserAPI}  userApi  The User API to be validated
   *
   * @throws  {Error}             If User Api is deleted
   */
  private _validateNotDeleted(userApi: UserAPI) {
    if (userApi.status === UserAPIStatus.Deactive) {
      throw new Error("Business user already deleted");
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
decorate(injectable(), DeleteUserApiService);
