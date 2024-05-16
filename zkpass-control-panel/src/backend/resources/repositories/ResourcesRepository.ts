/*
 * ResourcesRepository.ts
 * Repository to list API Usage data from ElasticSearch
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: January 16th 2024
 * -----
 * Last Modified: January 19th 2024
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
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
import { injectable, decorate } from "inversify";
import { FilterApiUsagePayload } from "@/backend/resources/interfaces/ResourcesInterfaces";
import {
  ApiUsageType,
  AggregateCount,
  CalendarInterval,
  AggregationBucket,
} from "@resources/constants/ResourceConstants";
import { IResourcesRepository } from "@/backend/resources/interfaces/ResourcesRepoInterfaces";
import elasticClient from "@lib/elasticClient";
import { Client } from "@elastic/elasticsearch";
import { SearchTotalHits } from "@elastic/elasticsearch/lib/api/types";
import { PrismaClient } from "@prisma/client";
import prisma from "@/backend/libs/prisma";

export class ResourcesRepository implements IResourcesRepository {
  prisma: PrismaClient;
  elasticClient: Client;
  constructor() {
    this.prisma = prisma;
    this.elasticClient = elasticClient;
  }

  /**
   * List API Usage
   *
   * @param   {FilterApiUsagePayload | null}  filter  filter API Usage
   * @param   {number | undefined}            skip    Skip/Offset
   * @param   {number | undefined}            limit   Take/Limit
   *
   * @return  {{ totalApi: number; apiUsage: ApiUsageType[]; apiUsageAggregate: AggregateCount[] }}  API Usage and its aggregate count
   */
  async listApiUsage(
    filter: FilterApiUsagePayload | null,
    skip?: number | undefined,
    limit?: number | undefined
  ): Promise<{
    totalApi: number;
    apiUsage: ApiUsageType[];
    apiUsageAggregate: AggregateCount[];
  }> {
    try {
      const rest = await this.elasticClient.search({
        index: process.env.ELASTIC_API_USAGE_INDEX ?? "",
        body: {
          size: limit ?? 0,
          from: skip ?? 0,
          query: {
            bool: {
              must: [
                {
                  range: {
                    "api_data.timestamp": {
                      gte: filter?.start_date ?? "",
                      lte: filter?.end_date ?? "",
                    },
                  },
                },
                {
                  regexp: {
                    "api_data.api_key.keyword": `.*${filter?.api_key}.*`,
                  },
                },
              ],
            },
          },
          aggs: {
            over_time: {
              date_histogram: {
                field: "api_data.timestamp",
                calendar_interval: filter?.interval ?? CalendarInterval.Hourly,
              },
            },
          },
          sort: [
            {
              "api_data.timestamp": {
                order: "desc",
              },
            },
          ],
        },
      });

      const apiUsageBucket = (rest.aggregations?.over_time as AggregationBucket)
        .buckets;

      const hits: ApiUsageType[] = [];
      rest.hits.hits.forEach((hit: any) => {
        hits.push({
          ...hit._source.api_data,
          id: hit._id,
        });
      });
      const totalHits = (rest.hits.total as SearchTotalHits).value;

      return {
        totalApi: totalHits,
        apiUsage: hits,
        apiUsageAggregate: apiUsageBucket,
      };
    } catch (error) {
      return {
        totalApi: 0,
        apiUsage: [],
        apiUsageAggregate: [],
      };
    }
  }
}

decorate(injectable(), ResourcesRepository);
