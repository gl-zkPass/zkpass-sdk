/*
 * IQueueService.ts
 *
 * Authors:
 *   Zulchaidir (zulchaidir@gdplabs.id)
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
export interface IQueueService {
  /**
   * Creates a connection to the messaging queue.
   *
   * @return  void
   */
  createConnection(): Promise<void>;
  /**
   * Sends a message to the messaging queue.
   *
   * @param   {string}           message    The message to be sent
   * @param   {boolean}          autoClose  Whether to close the connection after sending the message
   *
   * @return  {void}
   */
  sendMessage(message: string): Promise<void>;
  /**
   * Closes the connection to the messaging queue.
   *
   * @return  {void}
   */
  closeConnection(): Promise<void>;
}
