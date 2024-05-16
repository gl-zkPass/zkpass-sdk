/*
 * DeleteUsersService.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: December 6th 2023
 * -----
 * Last Modified: December 14th 2023
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { injectable, decorate, inject } from "inversify";
import { User } from "@users/interfaces/UsersInterfaces";
import { IDeleteUsersService } from "@users/interfaces/UsersServicesInterfaces";
import type { IUsersRepository } from "../interfaces/UsersRepoInterfaces";
import {
  UserAction,
  UserRole,
  UserStatus,
} from "@users/constants/UsersConstants";
import { getUserPermissions } from "@users/helpers/UsersHelper";

export class DeleteUsersService implements IDeleteUsersService {
  userRepo: IUsersRepository;
  constructor(@inject("IUsersRepository") userRepo: IUsersRepository) {
    this.userRepo = userRepo;
  }

  /**
   * Delete User
   *
   * @param   {User}     loginUser  The admin user who delete the key
   * @param   {User}     user       The User to be deleted
   *
   * @return  {boolean}             Status of deleting User
   */
  async deleteUser(loginUser: User, user: User): Promise<boolean> {
    this._validatePermission(loginUser);
    const userToDelete = await this._getValidExistAccount(user);

    this._validateNotRoot(userToDelete);
    this._validateNotDeleted(userToDelete);
    this._validateNotSelfDelete(loginUser, userToDelete);

    const result = await this.userRepo.deleteUser(loginUser, userToDelete);

    return result;
  }

  /**
   * Validate the User is not root
   *
   * @param   {User}    user  The User to be validated
   *
   * @throws  {Error}         If User is root
   */
  private _validateNotRoot(user: User) {
    if (user.role === UserRole.Root) {
      throw new Error("Root user cannot be deleted");
    }
  }

  private _validateNotDeleted(user: User) {
    if (user.status === UserStatus.Deactive) {
      throw new Error("User already deleted");
    }
  }

  private _validateNotSelfDelete(loginUser: User, user: User) {
    if (user.email === loginUser.email) {
      throw new Error("Can not self delete");
    }
  }

  private _validatePermission(loginUser: User) {
    const permissions = getUserPermissions(loginUser);
    if (!permissions.includes(UserAction.DeleteUser)) {
      throw new Error("Insufficient permission");
    }
  }

  private async _getValidExistAccount(user: User): Promise<User> {
    const existingUser = await this.userRepo.findUser(user.email, user.id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    return existingUser;
  }
}
decorate(injectable(), DeleteUsersService);
