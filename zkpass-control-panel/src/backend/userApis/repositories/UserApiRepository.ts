/*
 * UserApiRepository.ts
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
import { User } from "@users/interfaces/UsersInterfaces";
import prisma from "@/backend/libs/prisma";
import { PrismaClient, UserApi } from "@prisma/client";
import { injectable, decorate } from "inversify";
import { IUserApiRepository } from "../interfaces/UserApiRepoInterface";
import { UserAPI } from "../interfaces/UserApiInterface";
import { FilterUserApisPayload } from "@/backend/requests/UserApisRequestInterface";
import { UserAPIStatus } from "../constants/UserApiConstants";

export class UserApiRepository implements IUserApiRepository {
  DEFAULT_TAKE = 20;
  DEFAULT_SKIP = 0;
  prisma: PrismaClient;
  constructor() {
    this.prisma = prisma;
  }
  /**
   * Add new User API
   *
   * @param   {User}     loginUser  The admin user who add the key
   * @param   {UserAPI}  userApi    The User API to be added
   *
   * @return  {number}              The ID of the added User API
   */
  async addUserApi(loginUser: User, userApi: UserAPI): Promise<number> {
    let result = await this.prisma.userApi.create({
      data: {
        email: userApi.email,
        name: userApi.name,
        status: UserAPIStatus.Active,
        createdBy: loginUser.email,
        lastModifiedBy: loginUser.email,
      },
    });
    return result.id;
  }

  /**
   * Find User API by email
   *
   * @param   {string}   email  The email of the user
   *
   * @return  {UserAPI | null}  The User API or null if not found
   */
  async findUserApi(email: string): Promise<UserAPI | null> {
    let query: any = null;
    query = {
      where: {
        email: email,
      },
    };
    const queryResult = await this.prisma.userApi.findFirst(query);

    let userApi: UserAPI | null = null;
    if (queryResult) {
      userApi = {
        ...queryResult,
        createdAt: new Date(queryResult.createdAt),
        lastModifiedAt: new Date(queryResult.lastModifiedAt),
      };
    }
    return userApi;
  }

  /**
   * Find User API by id
   *
   * @param   {number<UserAPI>}   id  The id of the user
   *
   * @return  {UserAPI | null}      The User API or null if not found
   */
  async findUserApiById(id: number): Promise<UserAPI | null> {
    let query: any = null;
    query = {
      where: {
        id: id,
      },
    };
    const queryResult = await this.prisma.userApi.findFirst(query);

    let userApi: UserAPI | null = null;
    if (queryResult) {
      userApi = {
        ...queryResult,
        createdAt: new Date(queryResult.createdAt),
        lastModifiedAt: new Date(queryResult.lastModifiedAt),
      };
    }
    return userApi;
  }

  /**
   * List User APIs
   *
   * @param   {FilterUserApisPayload}  filter  The filter
   * @param   {number}                 skip    The skip
   * @param   {number}                 take    The take
   *
   * @return  {{ userApis: UserAPI[]; total: number }}  List of User APIs and total count
   */
  async listUserApis(
    filter: FilterUserApisPayload | null,
    skip: number = this.DEFAULT_SKIP,
    take: number = this.DEFAULT_TAKE
  ): Promise<{ userApis: UserAPI[]; total: number }> {
    let userApis: UserAPI[] = [];

    const filterName = filter?.name ?? "";
    const filterEmail = filter?.email ?? "";
    let filterStatus: UserAPIStatus[] = [
      UserAPIStatus.Active,
      UserAPIStatus.Deactive,
    ];
    if (filter?.status) {
      filterStatus = [filter.status];
    }
    const queryResult = await this.prisma.userApi.findMany({
      skip: skip,
      take: take,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        OR: [
          {
            email: {
              contains: filterEmail,
            },
            name: {
              contains: filterName,
            },
          },
        ],
        AND: [
          filter?.status !== UserAPIStatus.None
            ? {
                status: {
                  in: filterStatus,
                },
              }
            : {},
        ],
      },
    });
    queryResult.map((userApi) => {
      userApis.push({
        ...userApi,
        createdAt: new Date(userApi.createdAt),
        lastModifiedAt: new Date(userApi.lastModifiedAt),
      });
    });
    let total = 0;
    if (userApis.length > 0) {
      total = await this.prisma.userApi.count({
        where: {
          OR: [
            {
              name: {
                contains: filterName,
              },
              email: {
                contains: filterEmail,
              },
            },
          ],
          AND: [
            filter?.status !== UserAPIStatus.None
              ? {
                  status: {
                    in: filterStatus,
                  },
                }
              : {},
          ],
        },
      });
    }

    return { userApis, total };
  }

  /**
   * Delete User API
   *
   * @param   {UserAPI<boolean>}  userApi  The User API to be deleted
   *
   * @return  {boolean}                    Deletion status
   */
  async deleteUserApi(userApi: UserAPI): Promise<boolean> {
    // Soft delete, set status to deactive
    await this.prisma.$transaction(async (tx) => {
      await tx.userApi.update({
        where: {
          id: userApi.id,
          email: userApi.email,
        },
        data: {
          status: UserAPIStatus.Deactive,
          lastModifiedBy: userApi.lastModifiedBy,
        },
      });
      await tx.apiKey.updateMany({
        where: {
          userId: userApi.id,
        },
        data: {
          status: UserAPIStatus.Deactive,
          lastModifiedBy: userApi.lastModifiedBy,
        },
      });
    });
    return true;
  }

  /**
   * Update User API
   *
   * @param   {UserAPI}  userApi  The User API to be updated
   *
   * @return  {boolean}           Update status
   */
  async updateUserApi(userApi: UserAPI): Promise<boolean> {
    if (userApi.status === UserAPIStatus.Deactive) {
      await this.deleteUserApi(userApi);
    }

    await this.prisma.userApi.update({
      where: {
        id: userApi.id,
        email: userApi.email,
      },
      data: {
        email: userApi.email,
        name: userApi.name,
        status: userApi.status,
        lastModifiedBy: userApi.lastModifiedBy,
      },
    });
    return true;
  }

  /**
   * List UserApi by Given Api Keys
   *
   * @param   {string[]}  apiKeys List of API Keys
   *
   * @return  { APIKey[] }  All of listed API Keys
   */
  async listUserApiByApiKeys(apiKeys: string[]): Promise<UserApi[]> {
    const queryResult = await this.prisma.userApi.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: { apiKeys: true },
      where: {
        apiKeys: {
          some: {
            key: {
              in: apiKeys,
            },
          },
        },
      },
    });

    return queryResult;
  }
}
decorate(injectable(), UserApiRepository);
