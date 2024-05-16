/*
 * AddUsersService.ts
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
import { injectable, inject, decorate } from "inversify";
import { User } from "@users/interfaces/UsersInterfaces";
import { IAddUsersService } from "@users/interfaces/UsersServicesInterfaces";
import type { IUsersRepository } from "@users/interfaces/UsersRepoInterfaces";
import {
  getUserPermissions,
  isInternalEmail,
  isValidEmailFormat,
  isValidNameFormat,
  isValidStringLength,
} from "@users/helpers/UsersHelper";
import {
  UserAction,
  UserNameDefault,
  UserRole,
} from "@users/constants/UsersConstants";

export class AddUsersService implements IAddUsersService {
  VALID_ROLES = [UserRole.Admin];

  userRepo: IUsersRepository;

  constructor(@inject("IUsersRepository") userRepo: IUsersRepository) {
    this.userRepo = userRepo;
  }

  /**
   * Add new User
   *
   * @param   {User}     loginUser  The admin user who add the key
   * @param   {User}     newUser    The new user to be added
   *
   * @return  {boolean}             Status
   */
  async addUser(loginUser: User, newUser: User): Promise<boolean> {
    this._validatePermission(loginUser);

    this._validateEmailFormat(newUser);
    await this._validateUniqueEmail(newUser);

    this._validateNameLength(newUser);
    this._validateNameFormat(newUser);

    this._validateRole(newUser);
    this._validateAdminRole(newUser);

    const result = await this.userRepo.addUser(loginUser, newUser);
    return result;
  }

  /**
   * Validate permission
   *
   * @param   {User}         loginUser  The admin user who add the key
   *
   * @throws  {Error}                   If user does not have permission
   */
  private _validatePermission(loginUser: User) {
    const permissions = getUserPermissions(loginUser);
    if (!permissions.includes(UserAction.CreateUser)) {
      throw new Error("Insufficient permission");
    }
  }

  /**
   * Validate whether user email exists
   *
   * @param   {User}  user  The user to be validated
   *
   * @throws  {Error}       If user email already exists
   */
  private async _validateUniqueEmail(user: User) {
    const existingUser = await this.userRepo.findUser(user.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }
  }

  /**
   * Validate email format
   *
   * @param   {User}  user  The user to be validated
   *
   * @throws  {Error}       If email format is invalid
   */
  private _validateEmailFormat(user: User) {
    if (!isValidEmailFormat(user.email)) {
      throw new Error("Invalid email format");
    }
  }

  /**
   * Validate name format
   *
   * @param   {User}  user  The user to be validated
   *
   * @throws  {Error}       If name format is invalid or length is invalid
   */
  private _validateNameFormat(user: User) {
    if (!isValidNameFormat(user.name)) {
      throw new Error("Invalid name format");
    }
  }

  /**
   * Validate name length
   *
   * @param   {User}  user  The user to be validated
   *
   * @throws  {Error}       If name length is invalid or length is invalid
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
   * Validate role
   *
   * @param   {User}  user  The user to be validated
   *
   * @throws  {Error}       If role is invalid
   */
  private _validateRole(user: User) {
    if (!this.VALID_ROLES.includes(user.role)) {
      throw new Error("Invalid role target");
    }
  }

  /**
   * Validate admin role
   *
   * @param   {User}  user  The user to be validated
   *
   * @throws  {Error}       If adding admin role to non internal email
   */
  private _validateAdminRole(user: User) {
    if (user.role === UserRole.Admin && !isInternalEmail(user.email)) {
      throw new Error("Admin role only for internal email");
    }
  }
}
decorate(injectable(), AddUsersService);
