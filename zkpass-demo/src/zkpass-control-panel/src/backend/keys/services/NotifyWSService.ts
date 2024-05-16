/*
 * NotifyWSService.ts
 *
 * This file contains the implementation of the NotifyWSService class, which is responsible for sending messages to a messaging queue.
 *
 * Authors:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *
 * Created at: December 12th 2023
 * -----
 * Last Modified: December 20th 2023
 * Modified By: Zulchaidir (zulchaidir@gdplabs.id)
 * -----
 * Reviewers:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { decorate, inject, injectable } from "inversify";
import type { IQueueService } from "@/backend/messagingQueue/interfaces/IQueueService";

const CACHE_REBUILD_MESSAGE =
  process.env.CACHE_REBUILD_MESSAGE || "cache_rebuild";

export class NotifyWSService {
  constructor(@inject("IQueueService") private queueService: IQueueService) {
    this.queueService = queueService;
  }

  /**
   * Rebuilds the API key cache by sending a message to the messaging queue.
   *
   * @returns A promise that resolves to a boolean indicating whether the message was successfully sent.
   */
  public rebuildApiKeyCache(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.queueService.sendMessage(CACHE_REBUILD_MESSAGE);

        resolve(true);
      } catch (error) {
        resolve(false);
      }
    });
  }
}

decorate(injectable(), NotifyWSService);
