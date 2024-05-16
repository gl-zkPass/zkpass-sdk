/*
 * KeysRepository.ts
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created at: December 14th 2023
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
import { User } from "@users/interfaces/UsersInterfaces";
import prisma from "@/backend/libs/prisma";
import { PrismaClient } from "@prisma/client";
import { injectable, decorate } from "inversify";
import { IKeysRepository } from "../interfaces/KeysRepoInterfaces";
import { APIKey } from "../interfaces/KeysInterface";
import { FilterKeysPayload } from "@/backend/requests/KeysRequestInterface";
import { APIKeyStatus, PlaceholderValue } from "../constants/KeysConstants";
import { UserAPI } from "@/backend/userApis/interfaces/UserApiInterface";
import { UserAPIStatus } from "@/backend/userApis/constants/UserApiConstants";

export class KeysRepository implements IKeysRepository {
  DEFAULT_TAKE = 20;
  DEFAULT_SKIP = 0;
  prisma: PrismaClient;
  constructor() {
    this.prisma = prisma;
  }

  /**
   * Add new API Key
   *
   * @param   {User}    loginUser  The admin user who add the key
   * @param   {APIKey}  apiKey     The API Key to be added
   * @param   {string}  email      The email of the user who will use the API Key
   *
   * @return  {boolean}  [return description]
   */
  async addKey(
    loginUser: User,
    apiKey: APIKey,
    email: string
  ): Promise<boolean> {
    await this.prisma.$transaction(async (tx) => {
      if (apiKey.userId === 0) {
        const userApi: UserAPI = {
          id: Number(PlaceholderValue.Number),
          email: email,
          name: email,
          status: UserAPIStatus.Active,
          createdAt: apiKey.createdAt,
          createdBy: apiKey.lastModifiedBy,
          lastModifiedAt: apiKey.lastModifiedAt,
          lastModifiedBy: apiKey.lastModifiedBy,
        };
        let result = await tx.userApi.create({
          data: {
            email: userApi.email,
            name: userApi.name,
            status: APIKeyStatus.Active,
            createdBy: loginUser.email,
            lastModifiedBy: loginUser.email,
          },
        });
        apiKey.userId = result.id;
      }
      await tx.apiKey.create({
        data: {
          key: apiKey.key,
          secretKey: apiKey.secretKey,
          name: apiKey.name,
          lastModifiedBy: loginUser.email,
          createdBy: loginUser.email,
          userId: apiKey.userId,
          status: apiKey.status,
        },
      });
    });
    return true;
  }

  /**
   * Delete API Key
   *
   * @param   {APIKey}            apiKey  The API Key to be deleted
   *
   * @return  {Promise<boolean>}          Deletion status
   */
  async deleteKey(apiKey: APIKey): Promise<boolean> {
    // Soft delete, set status to deactive
    await this.prisma.apiKey.update({
      where: {
        id: apiKey.id,
        userId: apiKey.userId,
        key: apiKey.key,
      },
      data: {
        status: APIKeyStatus.Deactive,
        lastModifiedBy: apiKey.lastModifiedBy,
      },
    });
    return true;
  }

  /**
   * List API Keys
   *
   * @param   {FilterKeysPayload | null}  filter  Filter list of API Keys
   * @param   {number}                    skip    Skip/Offset
   * @param   {number}                    take    Take/Limit
   *
   * @return  {{ apiKeys: APIKey[]; total: number }}  List of API Keys and total count
   */
  async listKeys(
    filter: FilterKeysPayload | null,
    skip: number = this.DEFAULT_SKIP,
    take: number = this.DEFAULT_TAKE
  ): Promise<{ apiKeys: APIKey[]; total: number }> {
    let apiKeys: APIKey[] = [];

    const filterApiKeyName = filter?.apiKeyName ?? "";
    const filterEmail = filter?.email ?? "";
    let filterStatus: APIKeyStatus[] = [
      APIKeyStatus.Active,
      APIKeyStatus.Deactive,
    ];
    if (filter?.status) {
      filterStatus = [filter.status];
    }
    const queryResult = await this.prisma.apiKey.findMany({
      skip: skip,
      take: take,
      orderBy: {
        createdAt: "desc",
      },
      include: { user: true },
      where: {
        OR: [
          {
            user: {
              email: {
                contains: filterEmail,
              },
            },
            name: {
              contains: filterApiKeyName,
            },
          },
        ],
        AND: [
          filter?.status !== APIKeyStatus.None
            ? {
                status: {
                  in: filterStatus,
                },
              }
            : {},
        ],
      },
    });
    queryResult.map((apiKey) => {
      apiKeys.push({
        ...apiKey,
        createdAt: new Date(apiKey.createdAt),
        lastModifiedAt: new Date(apiKey.lastModifiedAt),
      });
    });
    let total = 0;
    if (apiKeys.length > 0) {
      total = await this.prisma.apiKey.count({
        where: {
          OR: [
            {
              name: {
                contains: filterApiKeyName,
              },
              user: {
                email: {
                  contains: filterEmail,
                },
              },
            },
          ],
          AND: [
            filter?.status !== APIKeyStatus.None
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

    return { apiKeys, total };
  }

  /**
   * Find API Key
   *
   * @param   {number}            id      API Key ID
   * @param   {number}            userId  User ID
   * @param   {string}            key     API Key
   *
   * @return  {APIKey | null}  API Key
   */
  async findKey(
    id: number,
    userId: number,
    key: string
  ): Promise<APIKey | null> {
    const queryResult = await this.prisma.apiKey.findFirst({
      where: {
        id: id,
        userId: userId,
        key: key,
      },
      include: { user: true },
    });

    let apiKey: APIKey | null = null;
    if (queryResult) {
      apiKey = {
        ...queryResult,
        createdAt: new Date(queryResult.createdAt),
        lastModifiedAt: new Date(queryResult.lastModifiedAt),
      };
    }
    return apiKey;
  }

  /**
   * Update API Key
   *
   * @param   {APIKey}   apiKey  Updated API Key
   *
   * @return  {boolean}          Update status
   */
  async updateKey(apiKey: APIKey): Promise<boolean> {
    await this.prisma.apiKey.update({
      where: {
        id: apiKey.id,
        userId: apiKey.userId,
        key: apiKey.key,
      },
      data: {
        status: apiKey.status,
        name: apiKey.name,
        lastModifiedBy: apiKey.lastModifiedBy,
      },
    });
    return true;
  }
}
decorate(injectable(), KeysRepository);
