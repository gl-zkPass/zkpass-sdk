/*
 * rabbitmq.rs
 * This file is for rabbitmq connection and service
 *
 * Authors:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   Janice Laksana(janice.laksana@gdplabs.id)
 * Created at: December 5th 2023
 * -----
 * Last Modified: March 7th 2024
 * Modified By:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   Janice Laksana(janice.laksana@gdplabs.id)
 *   ntejapermana (nugraha.tejapermana@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   Khandar William (khandar.william@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * ---
 * References:
 *   [1] https://github.com/rabbitmq/rabbitmq-tutorials/tree/main/rust-amqprs
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

use amqprs::{
    connection::{ Connection, OpenConnectionArguments },
    callbacks::{ DefaultConnectionCallback, DefaultChannelCallback },
    channel::{
        QueueDeclareArguments,
        BasicConsumeArguments,
        BasicAckArguments,
        QueueBindArguments,
        ExchangeDeclareArguments,
    },
};
use tokio::select;
use tokio_util::sync::CancellationToken;
use tracing::{ info, error };
use zkpass_svc_common::interface::{ errors::{ ZkPassMQError, ZkPassUtilError }, retrieve_env_var };
use crate::api_key::retrieve_api_key;
use lazy_static::lazy_static;

lazy_static! {
    static ref ENV_VARS: Result<EnvVars, ZkPassUtilError> = {
        let host = retrieve_env_var("RABBITMQ_HOST")?;
        let port = retrieve_env_var("RABBITMQ_PORT")?;
        let port = port.parse().map_err(|_| ZkPassUtilError::CustomError("Invalid RABBITMQ_PORT env variable".to_string()))?;
        let user = retrieve_env_var("RABBITMQ_USER")?;
        let password = retrieve_env_var("RABBITMQ_PASSWORD")?;
        let exchange = retrieve_env_var("RABBITMQ_EXCHANGE")?;
        let exchange_type = retrieve_env_var("RABBITMQ_EXCHANGE_TYPE")?;
        let rebuild_message = retrieve_env_var("CACHE_REBUILD_MESSAGE")?;

        Ok(EnvVars { host, port, user, password, exchange, exchange_type, rebuild_message })
    };
}

#[derive(Debug)]
struct EnvVars {
    host: String,
    port: u16,
    user: String,
    password: String,
    exchange: String,
    exchange_type: String,
    rebuild_message: String,
}

pub async fn receive_msg(term_token: CancellationToken) -> Result<(), ZkPassUtilError> {
    info!("entered");
    let env_vars = (match ENV_VARS.as_ref() {
        Ok(env_vars) => Ok(env_vars),
        Err(err) => {
            let error = err.clone();
            Err(error)
        }
    })?;

    let conn = init_conn(&env_vars).await?;

    let (queue_name, channel) = declare_exchange_and_queue(&conn, &env_vars).await?;

    let consumer_args = BasicConsumeArguments::default().queue(String::from(&queue_name)).finish();

    let (_ctag, mut rx) = channel
        .basic_consume_rx(consumer_args).await
        .map_err(|_| ZkPassUtilError::MQError(ZkPassMQError::ConsumeError))?;

    info!("RabbitMQ waiting for messages...");

    select! {
        _ = term_token.cancelled() => {
            info!("Begin stopping RabbitMQ service...");

            info!("Closing RabbitMQ connection...");
            let _ = conn.close().await.map_err(|_| error!("Failed to close connection"));

            info!("Closing RabbitMQ channel...");
            let _ = channel.close().await.map_err(|_| error!("Failed to close channel"));

            info!("RabbitMQ service stopped");
        },
        _ = async {
            while let Some(msg) = rx.recv().await {
                if let Some(payload) = msg.content {
                    let command = match std::str::from_utf8(&payload) {
                        Ok(command) => command,
                        Err(err) => {
                            error!("Failed to decode payload: {:?}", err);
                            continue;
                        }
                    };

                    info!(" Received message from RabbitMQ server {:?}", command);

                    if command == env_vars.rebuild_message.as_str() {
                        info!("Rebuilding api key cache...");
                        retrieve_api_key().await;
                    }

                    let deliver_msg = match msg.deliver {
                        Some(deliver_msg) => deliver_msg,
                        None => {
                            info!("No delivery message");
                            continue;
                        }
                    };
                    let ack_args = BasicAckArguments::new(deliver_msg.delivery_tag(), false);
                    match channel.basic_ack(ack_args).await {
                        Ok(_) => (),
                        Err(err) => error!("Failed to acknowledge message: {:?}", err),
                    }
                }
            }
        } => {}
    }

    Ok(())
}

async fn init_conn(env_vars: &EnvVars) -> Result<Connection, ZkPassUtilError> {
    Connection::open(
        &OpenConnectionArguments::new(
            &env_vars.host,
            env_vars.port,
            &env_vars.user,
            &env_vars.password
        )
    ).await.map_err(|_| ZkPassUtilError::MQError(ZkPassMQError::ConnectionError))
}

async fn declare_exchange_and_queue(
    conn: &amqprs::connection::Connection,
    env_vars: &EnvVars
) -> Result<(String, amqprs::channel::Channel), ZkPassUtilError> {
    conn
        .register_callback(DefaultConnectionCallback).await
        .map_err(|_| ZkPassUtilError::MQError(ZkPassMQError::ConnectionCallbackError))?;

    let channel = conn
        .open_channel(None).await
        .map_err(|_| ZkPassUtilError::MQError(ZkPassMQError::ChannelError))?;

    channel
        .register_callback(DefaultChannelCallback).await
        .map_err(|_| ZkPassUtilError::MQError(ZkPassMQError::ChannelCallbackError))?;

    let ex_name: &str = &env_vars.exchange;
    let ex_type: &str = &env_vars.exchange_type;
    let ex_args = ExchangeDeclareArguments::new(ex_name, ex_type).durable(true).finish();
    channel
        .exchange_declare(ex_args).await
        .map_err(|_| ZkPassUtilError::MQError(ZkPassMQError::DeclareError))?;

    let queue_args = QueueDeclareArguments::new("").durable(false).exclusive(true).finish();
    let (queue_name, _, _) = match
        channel
            .queue_declare(queue_args).await
            .map_err(|_| ZkPassUtilError::MQError(ZkPassMQError::DeclareError))?
    {
        Some(a) => a,
        None => {
            info!("No queue declared");
            return Err(ZkPassUtilError::MQError(ZkPassMQError::DeclareError));
        }
    };

    channel
        .queue_bind(QueueBindArguments::new(&queue_name, ex_name, "")).await
        .map_err(|_| ZkPassUtilError::MQError(ZkPassMQError::BindError))?;

    Ok((queue_name, channel))
}
