/*
 * RabbitMQService.ts
 *
 * Authors:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * Created at: December 12th 2023
 * -----
 * Last Modified: December 22nd 2023
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
import { decorate, injectable } from "inversify";
import { IQueueService } from "../interfaces/IQueueService";
import * as amqplib from "amqplib";

const RABBITMQ_HOST = process.env.RABBITMQ_HOST || "localhost";
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || "5672";
const RABBITMQ_USER = process.env.RABBITMQ_USER || "guest";
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || "guest";
const RABBITMQ_EXCHANGE = process.env.RABBITMQ_EXCHANGE || "zkpass";
const RABBITMQ_EXCHANGE_TYPE = process.env.RABBITMQ_EXCHANGE_TYPE || "fanout";

export class RabbitMQService implements IQueueService {
  private connection: amqplib.Connection | undefined;
  private channel: amqplib.Channel | undefined;

  connectionObject: amqplib.Options.Connect = {
    protocol: "amqp",
    hostname: RABBITMQ_HOST,
    port: parseInt(RABBITMQ_PORT),
    username: RABBITMQ_USER,
    password: RABBITMQ_PASSWORD,
  };

  /**
   * Creates a connection to the messaging queue.
   *
   * @throws  {Error}            Throws an error if the connection is not established
   *
   * @return  void
   */
  async createConnection(): Promise<void> {
    try {
      this.connection = await amqplib.connect(this.connectionObject);
      this.channel = await this.connection.createChannel();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sends a message to the messaging queue.
   *
   * @param   {string}           message    The message to be sent
   * @param   {boolean}          autoClose  Whether to close the connection after sending the message
   *
   * @throws  {Error}            Throws an error if the connection is not established, exchange is not established or message is not sent
   *
   * @return  {void}
   */
  async sendMessage(message: string, autoClose: boolean = true): Promise<void> {
    try {
      if (this.channel === undefined) {
        await this.createConnection();
      }

      await this.channel!.assertExchange(
        RABBITMQ_EXCHANGE,
        RABBITMQ_EXCHANGE_TYPE,
        {
          durable: true,
        }
      );
      await this.channel!.publish(RABBITMQ_EXCHANGE, "", Buffer.from(message));

      if (autoClose) {
        await this.closeConnection();
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Closes the connection to the messaging queue.
   *
   * @throws  {Error}            Throws an error if there is an error from library
   *
   * @return  {void}
   */
  async closeConnection(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }

      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      throw error;
    }
  }
}
decorate(injectable(), RabbitMQService);
