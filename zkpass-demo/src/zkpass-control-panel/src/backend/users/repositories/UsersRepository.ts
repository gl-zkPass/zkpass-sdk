/*
 * UsersServicesInterfaces.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: December 11th 2023
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
import { User } from "@users/interfaces/UsersInterfaces";
import { FilterUsersPayload } from "@/backend/requests/UsersRequestInterface";
import { IUsersRepository } from "@users/interfaces/UsersRepoInterfaces";
import prisma from "@/backend/libs/prisma";
import { PrismaClient } from "@prisma/client";
import { UserRole, UserStatus } from "@users/constants/UsersConstants";
import { injectable, decorate } from "inversify";

export class UsersRepository implements IUsersRepository {
  DEFAULT_TAKE = 20;
  DEFAULT_SKIP = 0;
  prisma: PrismaClient;
  constructor() {
    this.prisma = prisma;
  }
  /**
   * Add new User
   *
   * @param   {User}     loginUser  The admin user who add the key
   * @param   {User}     newUser    The User to be added
   *
   * @return  {boolean}             Status
   */
  async addUser(loginUser: User, newUser: User): Promise<boolean> {
    await this.prisma.user.create({
      data: {
        email: newUser.email,
        name: newUser.name,
        roleId: newUser.role,
        status: UserStatus.Active,
        createdBy: loginUser.email,
        lastModifiedBy: loginUser.email,
      },
    });
    return true;
  }

  /**
   * Delete User
   *
   * @param   {User}              loginUser   The admin user who add the key
   * @param   {User<boolean>}     targetUser  The User to be deleted
   *
   * @return  {boolean}                       Status of the deletion
   */
  async deleteUser(loginUser: User, targetUser: User): Promise<boolean> {
    // Soft delete, set status to deactive
    await this.prisma.user.update({
      where: {
        id: targetUser.id,
        email: targetUser.email,
      },
      data: {
        status: UserStatus.Deactive,
        lastModifiedBy: loginUser.email,
      },
    });
    return true;
  }

  /**
   * List Users
   *
   * @param   {FilterUsersPayload}  filter  The filter
   * @param   {number}              skip    Skip/Offset
   * @param   {number}              take    Take/Limit
   *
   * @return  {{ users: User[]; total: number }}  List of Users and total count
   */
  async listUsers(
    filter: FilterUsersPayload | null,
    skip: number = this.DEFAULT_SKIP,
    take: number = this.DEFAULT_TAKE
  ): Promise<{ users: User[]; total: number }> {
    const filterName = filter?.name ?? "";
    const filterEmail = filter?.email ?? "";
    let filterRole: UserRole[] = [UserRole.Root, UserRole.Admin];
    if (filter?.role) {
      filterRole = [filter.role];
    }
    let filterStatus: UserStatus[] = [UserStatus.Active, UserStatus.Deactive];
    if (filter?.status) {
      filterStatus = [filter.status];
    }

    let users: User[] = [];

    const queryResult = await this.prisma.user.findMany({
      skip: skip,
      take: take,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        OR: [
          {
            name: {
              contains: filterName,
            },
          },
          {
            email: {
              contains: filterEmail,
            },
          },
        ],
        AND: [
          {
            roleId: {
              in: filterRole,
            },
          },
          {
            status: {
              in: filterStatus,
            },
          },
        ],
      },
    });
    queryResult.map((user) => {
      users.push({
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        role: user.roleId,
        createdAt: new Date(user.createdAt),
        lastModifiedAt: new Date(user.lastModifiedAt),
        createdBy: user.createdBy,
        lastModifiedBy: user.lastModifiedBy,
      });
    });
    let total = 0;
    if (users.length > 0) {
      total = await this.prisma.user.count({
        where: {
          OR: [
            {
              name: {
                contains: filterName,
              },
            },
            {
              email: {
                contains: filterEmail,
              },
            },
          ],
          AND: [
            {
              roleId: {
                in: filterRole,
              },
            },
            {
              status: {
                in: filterStatus,
              },
            },
          ],
        },
      });
    }

    return { users, total };
  }

  /**
   * Find User
   *
   * @param   {string}   email   The email of the user
   * @param   {number}   userId  The id of the user
   *
   * @return  {User | null}          The User or null if not found
   */
  async findUser(email: string, userId: number = 0): Promise<User | null> {
    let query: any = null;
    query = {
      where: {
        email: email,
      },
    };
    if (userId > 0) {
      query = {
        where: {
          AND: [
            {
              email: {
                equals: email,
              },
              id: {
                equals: userId,
              },
            },
          ],
        },
      };
    }
    const queryResult = await this.prisma.user.findFirst(query);

    let user: User | null = null;
    if (queryResult) {
      user = {
        id: queryResult.id,
        email: queryResult.email,
        name: queryResult.name,
        status: queryResult.status,
        role: queryResult.roleId,
        createdAt: new Date(queryResult.createdAt),
        lastModifiedAt: new Date(queryResult.lastModifiedAt),
        createdBy: queryResult.createdBy,
        lastModifiedBy: queryResult.lastModifiedBy,
      };
    }
    return user;
  }
  /**
   * Find User by id
   *
   * @param   {number}   userId  The id of the user
   *
   * @return  {User | null}      The User or null if not found
   */
  async findUserById(userId: number): Promise<User | null> {
    let query: any = null;
    if (userId < 0) {
      return null;
    }
    query = {
      where: {
        id: {
          equals: userId,
        },
      },
    };
    const queryResult = await this.prisma.user.findFirst(query);

    let user: User | null = null;
    if (queryResult) {
      user = {
        ...queryResult,
        role: queryResult.roleId,
        createdAt: new Date(queryResult.createdAt),
        lastModifiedAt: new Date(queryResult.lastModifiedAt),
      };
    }
    return user;
  }

  /**
   * Update User
   *
   * @param   {User}     loginUser   The admin user who update the key
   * @param   {User}     targetUser  The User to be updated
   *
   * @return  {boolean}              Status of updating User
   */
  async updateUser(loginUser: User, targetUser: User): Promise<boolean> {
    await this.prisma.user.update({
      where: {
        id: targetUser.id,
        email: targetUser.email,
      },
      data: {
        name: targetUser.name,
        status: targetUser.status,
        lastModifiedBy: loginUser.email,
      },
    });
    return true;
  }
}
decorate(injectable(), UsersRepository);
