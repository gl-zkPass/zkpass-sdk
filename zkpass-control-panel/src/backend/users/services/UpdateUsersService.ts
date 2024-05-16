/*
 * UpdateUsersService.ts
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
import { IUpdateUsersService } from "@users/interfaces/UsersServicesInterfaces";
import type { IUsersRepository } from "@users/interfaces/UsersRepoInterfaces";
import {
  UserAction,
  UserNameDefault,
  UserRole,
  UserStatus,
} from "@users/constants/UsersConstants";
import {
  getUserPermissions,
  isInternalEmail,
  isValidNameFormat,
  isValidStringLength,
} from "@users/helpers/UsersHelper";

export class UpdateUsersService implements IUpdateUsersService {
  VALID_STATUS = [UserStatus.Active, UserStatus.Deactive];

  userRepo: IUsersRepository;
  constructor(@inject("IUsersRepository") userRepo: IUsersRepository) {
    this.userRepo = userRepo;
  }

  /**
   * Update User
   *
   * @param   {User}     loginUser  The admin user who update the key
   * @param   {User}     user       The User to be updated
   *
   * @return  {boolean}             Status of updating User
   */
  async updateUser(loginUser: User, user: User): Promise<boolean> {
    this._validatePermission(loginUser);

    this._validateNameLength(user);
    this._validateNameFormat(user);

    this._validateStatus(user);
    this._validateAdminRole(user);

    const existingUser = await this._getValidExistAccount(user);

    const updatedUser: User = {
      ...existingUser,
      name: user.name,
      status: user.status,
      role: user.role,
    };

    const result = await this.userRepo.updateUser(loginUser, updatedUser);
    return result;
  }

  /**
   * Get valid existing User
   *
   * @param   {User}     user  The User to be validated
   *
   * @throws  {Error}             If User does not exist
   */
  private async _getValidExistAccount(user: User): Promise<User> {
    const existingUser = await this.userRepo.findUser(user.email);
    if (!existingUser) {
      throw new Error("User not found");
    }
    return existingUser;
  }

  /**
   * Validate permission
   *
   * @param   {User}         loginUser  The admin user who update the key
   *
   * @throws  {Error}                   If user does not have permission
   */
  private _validatePermission(loginUser: User) {
    const permissions = getUserPermissions(loginUser);
    if (!permissions.includes(UserAction.UpdateUserData)) {
      throw new Error("Insufficient permission");
    }
  }

  /**
   * Validate name format
   *
   * @param   {User}  user  The User to be validated
   *
   * @throws  {Error}       If User name format is invalid
   */
  private _validateNameFormat(user: User) {
    if (!isValidNameFormat(user.name)) {
      throw new Error("Invalid name format");
    }
  }

  /**
   * Validate name length
   *
   * @param   {User}  user  The User to be validated
   *
   * @throws  {Error}       If User name length is invalid or length is invalid
   */
  private _validateNameLength(user: User) {
    if (
      !isValidStringLength(
        user.name,
        UserNameDefault.MinLength,
        UserNameDefault.MaxLength
      )
    ) {
      throw new Error(
        `Invalid name length, must be between ${UserNameDefault.MinLength} and ${UserNameDefault.MaxLength} characters`
      );
    }
  }

  /**
   * Validate status
   *
   * @param   {User}  user  The User to be validated
   *
   * @throws  {Error}       If User status is invalid
   */
  private _validateStatus(user: User) {
    if (!this.VALID_STATUS.includes(user.status)) {
      throw new Error("Invalid status target");
    }
  }

  /**
   * Validate admin role
   *
   * @param   {User}  user  The User to be validated
   *
   * @throws  {Error}       If User role is invalid
   */
  private _validateAdminRole(user: User) {
    if (user.role === UserRole.Admin && !isInternalEmail(user.email)) {
      throw new Error("Admin role only for internal email");
    }
  }
}
decorate(injectable(), UpdateUsersService);
