/*
 * ResourcesRepoInterfaces.ts
 * Interface for ResourceRepo to List API Key Usage
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
import {
  AggregateCount,
  ApiUsageType,
} from "@resources/constants/ResourceConstants";
import { FilterApiUsagePayload } from "@/backend/resources/interfaces/ResourcesInterfaces";

export interface IResourcesRepository {
  /**
   * List API Usage
   *
   * @param   {FilterApiUsagePayload | null}  filter  filter API Usage
   * @param   {number | undefined}            skip    Skip/Offset
   * @param   {number | undefined}            limit   Take/Limit
   *
   * @return  {{ totalApi: number; apiUsage: ApiUsageType[]; apiUsageAggregate: AggregateCount[] }}  API Usage and its aggregate count
   */
  listApiUsage(
    filter: FilterApiUsagePayload | null,
    skip?: number | undefined,
    limit?: number | undefined
  ): Promise<{
    totalApi: number;
    apiUsage: ApiUsageType[];
    apiUsageAggregate: AggregateCount[];
  }>;
}
