/*
 * ResourcesServicesInterfaces.ts
 * Interface for ResourceService to List API Key Usage
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: January 11th 2024
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
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */

import { User } from "@users/interfaces/UsersInterfaces";
import {
  ApiUsageType,
  AggregateCount,
} from "@resources/constants/ResourceConstants";
import { FilterApiUsagePayload } from "@resources/interfaces/ResourcesInterfaces";

export interface IListAPIKeyUsageService {
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
  listApiUsage(
    loginUser: User,
    filter: FilterApiUsagePayload | null,
    skip: number,
    take: number
  ): Promise<{
    totalApi: number;
    apiUsage: ApiUsageType[];
    apiUsageAggregate: AggregateCount[];
  }>;
}
