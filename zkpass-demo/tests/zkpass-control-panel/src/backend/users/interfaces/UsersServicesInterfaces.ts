/*
 * UsersServicesInterfaces.ts
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
import { FilterUsersPayload } from "@requests/UsersRequestInterface";
import { User } from "./UsersInterfaces";

export interface IAddUsersService {
  /**
   * Add new User
   *
   * @param   {User}     loginUser  The admin user who add the key
   * @param   {User}     newUser    The new user to be added
   *
   * @return  {boolean}             Status
   */
  addUser(loginUser: User, user: User): Promise<boolean>;
}

export interface IDeleteUsersService {
  /**
   * Delete User
   *
   * @param   {User}     loginUser  The admin user who delete the key
   * @param   {User}     user       The User to be deleted
   *
   * @return  {boolean}             Status of deleting User
   */
  deleteUser(loginUser: User, user: User): Promise<boolean>;
}

export interface IListUsersService {
  /**
   * List Users
   *
   * @param   {User}                      loginUser  The admin user who list the key
   * @param   {FilterUsersPayload | null}  filter     Filter list of Users
   * @param   {number}                    skip       Skip/Offset
   * @param   {number}                    take       Take/Limit
   *
   * @return  {{ users: User[]; total: number }}  List of Users and total count
   */
  listUsers(
    loginUser: User,
    filter: FilterUsersPayload | null,
    skip: number,
    take: number
  ): Promise<{ users: User[]; total: number }>;
}

export interface IUpdateUsersService {
  /**
   * Update User
   *
   * @param   {User}     loginUser  The admin user who update the key
   * @param   {User}     user       The User to be updated
   *
   * @return  {boolean}             Status of updating User
   */
  updateUser(loginUser: User, user: User): Promise<boolean>;
}
