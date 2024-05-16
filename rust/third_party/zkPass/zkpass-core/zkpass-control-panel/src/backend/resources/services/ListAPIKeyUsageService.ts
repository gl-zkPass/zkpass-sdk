/*
 * ListAPIKeyUsageService.ts
 * Manages List Api Key Usage with authentication and checks
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: December 6th 2023
 * -----
 * Last Modified: January 19th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   ntejapermana (nugraha.tejapermana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { injectable, decorate, inject } from "inversify";
import type { IResourcesRepository } from "@/backend/resources/interfaces/ResourcesRepoInterfaces";
import { IListAPIKeyUsageService } from "@/backend/resources/interfaces/ResourcesServicesInterfaces";
import { User } from "@users/interfaces/UsersInterfaces";
import {
  ApiUsageType,
  AggregateCount,
} from "@resources/constants/ResourceConstants";
import { FilterApiUsagePayload } from "@/backend/resources/interfaces/ResourcesInterfaces";
import { UserAction } from "@users/constants/UsersConstants";
import { getUserPermissions } from "@users/helpers/UsersHelper";
import {
  isValidDateRange,
  isValidDateString,
} from "@resources/helpers/ResourcesHelper";
import type { IUserApiRepository } from "@/backend/userApis/interfaces/UserApiRepoInterface";

export class ListAPIKeyUsageService implements IListAPIKeyUsageService {
  resourcesRepo: IResourcesRepository;
  userApiRepo: IUserApiRepository;
  constructor(
    @inject("IResourcesRepository") resourcesRepo: IResourcesRepository,
    @inject("IUserApiRepository") userApiRepo: IUserApiRepository
  ) {
    this.resourcesRepo = resourcesRepo;
    this.userApiRepo = userApiRepo;
  }

  /**
   * List API Usage
   *
   * @param   {User}                          loginUser  The admin user who list API Usage
   * @param   {FilterApiUsagePayload | null}  filter     Filter list of API Usage
   * @param   {number}                        skip       Skip/Offset
   * @param   {number}                        take       Take/Limit
   *
   * @return  {{ totalApi: number; apiUsage: ApiUsageType[]; apiUsageAggregate: AggregateCount[] }}  List of Users and api usage aggregate
   */
  async listApiUsage(
    loginUser: User,
    filter: FilterApiUsagePayload | null,
    skip: number,
    take: number
  ): Promise<{
    totalApi: number;
    apiUsage: ApiUsageType[];
    apiUsageAggregate: AggregateCount[];
  }> {
    this._validatePermission(loginUser);
    this._validateDateString(filter?.start_date);
    this._validateDateString(filter?.end_date);
    this._validateDateRange(filter?.start_date!, filter?.end_date!);

    const result = await this.resourcesRepo.listApiUsage(filter, skip, take);
    const uniqueApiKeys = this.getUniqueApiKeys(result.apiUsage);
    const userEmailByApiKeys = await this.getUserEmailByApiKeys(uniqueApiKeys);

    result.apiUsage.forEach((apiUsage: ApiUsageType) => {
      const userEmail = userEmailByApiKeys.get(apiUsage.api_key);
      apiUsage.email = userEmail || "";
    });

    return result;
  }
  /**
   * Get unique API keys from a list of API usage objects.
   *
   * @param   {ApiUsageType[]}  apiUsageList  List of ApiUsageType objects
   *
   * @return  {string[]}                     Array of unique API keys
   */
  private getUniqueApiKeys(apiUsageList: ApiUsageType[]): string[] {
    const uniqueApiKeysSet = new Set(
      apiUsageList.map((obj: ApiUsageType) => obj.api_key)
    );
    return Array.from(uniqueApiKeysSet);
  }

  /**
   * Retrieve user emails based on unique API keys.
   *
   * @param   {string[]}                      uniqueApiKeys  Array of unique API keys
   *
   * @return  {Promise<Map<string, string>>}                A Promise resolving to a map of API keys to user emails
   */
  private async getUserEmailByApiKeys(
    uniqueApiKeys: string[]
  ): Promise<Map<string, string>> {
    const userApis = await this.userApiRepo.listUserApiByApiKeys(uniqueApiKeys);
    const userEmailByApiKeys = new Map<string, string>();

    userApis.forEach((userApi: any) => {
      userApi.apiKeys.forEach((apiKey: any) => {
        userEmailByApiKeys.set(apiKey.key, userApi.email);
      });
    });

    return userEmailByApiKeys;
  }

  /**
   * Validate whether a string is a valid date string
   *
   * @param   {string}  dateString  The date string
   *
   * @throws  {Error}            Invalid date string
   */
  private _validateDateString(dateString: string | undefined) {
    if (!dateString || !isValidDateString(dateString)) {
      throw new Error("Invalid date string");
    }
  }

  /**
   * Validate whether start date is before end date
   *
   * @param   {string}  startDate  Start date
   * @param   {string}  endDate    End date
   *
   * @throws  {Error}            Invalid date range
   */
  private _validateDateRange(startDate: string, endDate: string) {
    if (!isValidDateRange(startDate, endDate)) {
      throw new Error("Invalid date range");
    }
  }

  /**
   * Validate whether the user has permission to list Users
   *
   * @param   {User}  loginUser  The admin user who list the key
   *
   * @throws  {Error}            Insufficient permission
   */
  private _validatePermission(loginUser: User) {
    const permissions = getUserPermissions(loginUser);
    if (!permissions.includes(UserAction.ListAPIKeyUsage)) {
      throw new Error("Insufficient permission");
    }
  }
}

decorate(injectable(), ListAPIKeyUsageService);
