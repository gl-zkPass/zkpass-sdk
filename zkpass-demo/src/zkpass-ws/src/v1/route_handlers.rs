/*
 * /v1/route_handlers.rs
 * This file contains the implementations of all route handlers with prefix "/v1/"
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: December 6th 2023
 * -----
 * Last Modified: May 3rd 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   Antony Halim (antony.halim@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

use actix_web::{ web, HttpResponse, Responder };
use tracing::{ error, info };
use zkpass_svc_common::interface::RequestGenerateProof;

use crate::utils::{ convert_socket_error_to_response_body, MAIN_SOCKET };

use super::generate_proof::client_generate_proof;

pub async fn generate_proof(data: Option<web::Json<RequestGenerateProof>>) -> impl Responder {
    info!("Client request generate proof");
    let mut guard = MAIN_SOCKET.write().await;
    if guard.is_some() {
        let mut socket = guard.as_mut().unwrap();
        let data = match data {
            Some(params) => {
                let request_generate_proof = params.into_inner();
                Some(request_generate_proof)
            }
            None => None,
        };
        match data {
            Some(data) => {
                match client_generate_proof(&mut socket, &data).await {
                    Ok(zkproof) => {
                        info!("Client success!");
                        HttpResponse::Ok().json(
                            serde_json::json!({
                                "status": 200,
                                "proof": zkproof
                            })
                        )
                    }
                    Err(err) => {
                        error!("Client failed! {:?}", err);
                        let error_body = convert_socket_error_to_response_body(&err);
                        HttpResponse::BadRequest().json(error_body)
                    }
                }
            }
            None =>
                HttpResponse::BadRequest().json(
                    serde_json::json!({
                            "status": 400,
                            "status_code": "NO_PARAMS",
                            "status_text": "There is no `dvr_token` & `user_data_token` params"
                        })
                ),
        }
    } else {
        HttpResponse::ServiceUnavailable().json(
            serde_json::json!({
                "status": 503,
                "status_code": "NOT_READY",
                "status_text": "Server is not ready yet, please try again later"
            })
        )
    }
}

#[cfg(test)]
mod tests {
    use crate::mocks::*;

    use super::*;
    use actix_web::{ http, test, App };
    use serde_json::json;
    use zkpass_svc_common::interface::socket::SocketConnection;

    const DVR_TOKEN: &str = "mock_dvr_token";
    const USER_DATA_TOKN: &str = "mock_user_data_token";

    async fn init_socket_and_args(is_socket_some: bool) {
        if is_socket_some {
            let mut guard = MAIN_SOCKET.write().await;
            let socket: Option<Box<dyn SocketConnection>> = Some(
                Box::new(
                    MockSocketConnection::new(
                        DVR_TOKEN.to_string().clone(),
                        USER_DATA_TOKN.to_string().clone()
                    )
                )
            );
            *guard = socket;
        } else {
            let mut guard = MAIN_SOCKET.write().await;
            *guard = None;
        }
    }

    #[actix_web::test]
    #[serial_test::serial]
    async fn test_generate_proof_success() {
        init_socket_and_args(true).await;

        let mut app = test::init_service(
            App::new().route("/v1/generate_proof", web::post().to(generate_proof))
        ).await;

        let request_body =
            json!({
                "dvr_token": DVR_TOKEN.to_string(),
                "user_data_token": USER_DATA_TOKN.to_string()
            });

        let request = test::TestRequest
            ::post()
            .uri("/v1/generate_proof")
            .set_json(&request_body)
            .to_request();

        let response = test::call_service(&mut app, request).await;
        assert_eq!(response.status(), http::StatusCode::OK);

        let body = test::read_body(response).await;
        let body_json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(body_json["status"], 200);
        assert_eq!(body_json["proof"], "{\"proof\":\"mock_proof\"}");
    }

    #[actix_web::test]
    #[serial_test::serial]
    async fn test_generate_proof_no_params() {
        init_socket_and_args(true).await;

        let mut app = test::init_service(
            App::new().route("/v1/generate_proof", web::post().to(generate_proof))
        ).await;

        let request = test::TestRequest::post().uri("/v1/generate_proof").to_request();

        let response = test::call_service(&mut app, request).await;
        assert_eq!(response.status(), http::StatusCode::BAD_REQUEST);

        let body = test::read_body(response).await;
        let body_json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(body_json["status"], 400);
        assert_eq!(body_json["status_code"], "NO_PARAMS");
        assert_eq!(body_json["status_text"], "There is no `dvr_token` & `user_data_token` params");
    }

    #[actix_web::test]
    #[serial_test::serial]
    async fn test_generate_proof_server_not_ready() {
        init_socket_and_args(false).await;

        let mut app = test::init_service(
            App::new().route("/v1/generate_proof", web::post().to(generate_proof))
        ).await;

        let request_body =
            json!({
                "dvr_token": DVR_TOKEN.to_string(),
                "user_data_token": USER_DATA_TOKN.to_string()
            });

        let request = test::TestRequest
            ::post()
            .uri("/v1/generate_proof")
            .set_json(&request_body)
            .to_request();

        let response = test::call_service(&mut app, request).await;
        assert_eq!(response.status(), http::StatusCode::SERVICE_UNAVAILABLE);

        let body = test::read_body(response).await;
        let body_json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(body_json["status"], 503);
        assert_eq!(body_json["status_code"], "NOT_READY");
        assert_eq!(body_json["status_text"], "Server is not ready yet, please try again later");
    }
}
