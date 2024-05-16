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

export interface IUsersRepository {
  /**
   * Add new User
   *
   * @param   {User}     loginUser  The admin user who add the key
   * @param   {User}     newUser    The User to be added
   *
   * @return  {boolean}             Status
   */
  addUser(loginUser: User, newUser: User): Promise<boolean>;
  /**
   * Delete User
   *
   * @param   {User}              loginUser   The admin user who add the key
   * @param   {User<boolean>}     targetUser  The User to be deleted
   *
   * @return  {boolean}                       Status of the deletion
   */
  deleteUser(loginUser: User, targetUser: User): Promise<boolean>;
  /**
   * List Users
   *
   * @param   {FilterUsersPayload}  filter  The filter
   * @param   {number}              skip    Skip/Offset
   * @param   {number}              take    Take/Limit
   *
   * @return  {{ users: User[]; total: number }}  List of Users and total count
   */
  listUsers(
    filter: FilterUsersPayload | null,
    skip?: number,
    limit?: number
  ): Promise<{ users: User[]; total: number }>;
  /**
   * Find User
   *
   * @param   {string}   email   The email of the user
   * @param   {number}   userId  The id of the user
   *
   * @return  {User | null}          The User or null if not found
   */
  findUser(email: string, userId?: number): Promise<User | null>;
  /**
   * Find User by id
   *
   * @param   {number}   userId  The id of the user
   *
   * @return  {User | null}      The User or null if not found
   */
  findUserById(userId: number): Promise<User | null>;
  /**
   * Update User
   *
   * @param   {User}     loginUser   The admin user who update the key
   * @param   {User}     targetUser  The User to be updated
   *
   * @return  {boolean}              Status of updating User
   */
  updateUser(loginUser: User, targetUser: User): Promise<boolean>;
}
