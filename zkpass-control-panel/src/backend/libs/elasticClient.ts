/*
 * elasticSearch.ts
 * Class to initiate ElasticSearch Client
 *
 * Authors:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: January 10th 2024
 * -----
 * Last Modified: January 19th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   handrianalandi (handrian.alandi@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   ntejapermana (nugraha.tejapermana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */

import { Client } from "@elastic/elasticsearch";

export const elasticClient = new Client({
  node: process.env.ELASTIC_NODE ?? "",
  auth: {
    apiKey: process.env.ELASTIC_API_KEY ?? "",
  },
});

export default elasticClient;
