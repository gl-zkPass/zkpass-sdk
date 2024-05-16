/*
 * ResourceConstants.ts
 * File storing types and enums for Resource Page
 *
 * Authors:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
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

export enum CalendarInterval {
  Hourly = "hour",
  Daily = "day",
  Weekly = "week",
  Monthly = "month",
  Yearly = "year",
}

export type AggregateCount = {
  key_as_string: string;
  key: number;
  doc_count: number;
};

export type AggregationBucket = {
  buckets: [AggregateCount];
};

export type ApiUsageType = {
  id: string;
  api_key: string;
  timestamp: string;
  endpoint: string;
  email: string;
  latency: string;
};
