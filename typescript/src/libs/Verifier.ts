/*
 * Verifier.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { KEY, SECRET, ZKPASS_SERVICE_URL } from "../utils/constants";
import {
  DvrModuleClient,
  DvrData as DvrDataNew,
  DvrDataPayload,
  extractPayload,
} from "@zkpass/dvr-client-ts";

export abstract class Verifier {
  readonly dvrModuleClient: DvrModuleClient;

  dvr: DvrDataPayload | null;
  constructor() {
    this.dvrModuleClient = new DvrModuleClient({
      baseUrl: ZKPASS_SERVICE_URL,
      apiKey: KEY,
      secretApiKey: SECRET,
    });
  }

  protected createDvr(signingKey: string, dvrData: DvrDataNew): string {
    const newDvrToken = this.dvrModuleClient.callDvrGenerateQueryToken(
      signingKey,
      dvrData
    );

    this.dvr = extractPayload(newDvrToken);

    return newDvrToken;
  }

  protected getDvr(): DvrDataPayload | null {
    return this.dvr;
  }

  abstract getDvrToken(dvrFile: string, dataTags: string[]): string;
}
