/*
 * routes.rs
 * This file contains all implementations of all common route handlers at main.rs
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

use actix_web::{ web, HttpRequest, HttpResponse, Responder };
use tracing::info;
use zkpass_core::interface::KeysetEndpoint;
use zkpass_svc_common::interface::errors::ZkPassSocketError;

use crate::cache::{ get_cache_public_keys, remove_single_public_keys };
use crate::health_check::{ host_health_check, QueryEngineInfo };
use crate::{ api_key::authenticate, client_check::client_version_check, utils::package_version };
use crate::jwks::read_jwks_from_file;
use crate::utils::{ convert_socket_error_to_response_body, MAIN_SOCKET };

pub async fn healthcheck(info: web::Query<QueryEngineInfo>) -> impl Responder {
    info!("healthcheck might take sometimes, because it involves zkpass-host healthcheck");
    let mut guard = MAIN_SOCKET.write().await;
    if guard.is_some() {
        let socket = guard.as_mut().unwrap();
        let query_engine_type = info.0.query_engine_type_param.unwrap_or("sp1".to_string());
        let query_engine_type = query_engine_type.as_str();

        let result = match host_health_check(socket, query_engine_type).await {
            Ok(result) => result,
            Err(err) => {
                return HttpResponse::BadRequest().json(convert_socket_error_to_response_body(&err));
            }
        };
        let r0_health_check = result.r0_health_check;
        let is_healthy = result.is_healthy;

        if is_healthy {
            HttpResponse::Ok().json(
                serde_json::json!({
                    "status": 200,
                    "status_code": "HEALTHY",
                    "status_text": "zkpass web server & host are healthy",
                    "status_query_engine": {
                        "r0": r0_health_check.as_str()
                    }
                })
            )
        } else {
            HttpResponse::ServiceUnavailable().json(
                serde_json::json!({
                    "status": 503,
                    "status_code": "NOT_HEALTHY",
                    "status_text": "zkpass web server is healthy, but zkpass host is not healthy",
                    "status_query_engine": {
                        "r0": r0_health_check.as_str()
                    }
                })
            )
        }
    } else {
        HttpResponse::ServiceUnavailable().json(
            serde_json::json!({
                "status": 503,
                "status_code": "NOT_HEALTHY",
                "status_text": "zkpass web server is healthy, but zkpass host is not healthy"
            })
        )
    }
}

pub async fn get_public_keys(data: Option<web::Json<KeysetEndpoint>>) -> impl Responder {
    info!("Retrieving public keys");
    let keyset = match data {
        Some(params) => {
            let keyset = params.into_inner();
            Some(keyset)
        }
        None => None,
    };
    match get_cache_public_keys(keyset).await {
        Ok(keys) =>
            HttpResponse::Ok().json(
                serde_json::json!({
            "status": 200,
            "public_keys": keys
        })
            ),
        Err(err) => {
            let zkpass_socket_err = ZkPassSocketError::UtilError(err);
            HttpResponse::BadRequest().json(
                convert_socket_error_to_response_body(&zkpass_socket_err)
            )
        }
    }
}

pub async fn remove_cached_public_keys(data: Option<web::Json<KeysetEndpoint>>) -> impl Responder {
    let keyset = match data {
        Some(params) => {
            let keyset = params.into_inner();
            Some(keyset)
        }
        None => None,
    };
    match keyset {
        Some(keyset) => {
            let result = remove_single_public_keys(keyset).await;
            match result {
                Ok(_) =>
                    HttpResponse::Ok().json(
                        serde_json::json!({
                    "status": 200,
                    "status_code": "COMPLETE",
                    "status_text": "Complete remove public keys associated with that keyset"
                })
                    ),
                Err(err) => {
                    let zkpass_socket_err = ZkPassSocketError::UtilError(err);
                    HttpResponse::BadRequest().json(
                        convert_socket_error_to_response_body(&zkpass_socket_err)
                    )
                }
            }
        }
        None =>
            HttpResponse::BadRequest().json(
                serde_json::json!({
            "status": 400,
            "status_code": "NO_PARAMS",
            "status_text": "There is no `jku` & `kid` params"
        })
            ),
    }
}

// Requests denied by Actix Web Guard will be handled here
pub async fn default_service(req: HttpRequest) -> impl Responder {
    let headers = req.headers();

    if !authenticate(headers) {
        // ApiGuard
        HttpResponse::Unauthorized().json(
            serde_json::json!({
                "status": 401,
                "status_code": "UNAUTHORIZED",
                "status_text": "Unauthorized, please input the correct token"
            })
        )
    } else if !client_version_check(headers) {
        // ClientVersionGuard
        HttpResponse::Forbidden().json(
            serde_json::json!({
                "status": 403,
                "status_code": "FORBIDDEN",
                "status_text": format!("Please check your zkPass client version. Server version: {}", package_version())
            })
        )
    } else {
        HttpResponse::NotFound().json(
            serde_json::json!({
                "status": 404,
                "status_code": "NOT_FOUND",
                "status_text": "Api / Web you are searching is not found"
            })
        )
    }
}

pub async fn get_jwks() -> HttpResponse {
    let jwks = read_jwks_from_file();
    HttpResponse::Ok().json(jwks)
}

#[cfg(test)]
mod tests {
    use std::sync::Once;

    use crate::api_key::retrieve_api_key;

    use super::*;
    use actix_web::{ http::{ self, header::{ HeaderName, HeaderValue } }, test, App };
    use serial_test::serial;
    use zkpass_core::interface::Jwk;

    static INIT: Once = Once::new();

    fn initialize() {
        INIT.call_once(|| {
            std::env::set_var("API_KEY_SOURCE", "file");
            std::env::set_var("API_KEY_FILE", "./sample-api-keys.json");
            std::env::set_var("JWKS_FILE_PATH", "./sample-jwks.json");
        });
    }

    #[actix_web::test]
    async fn test_remove_cached_public_keys_with_keyset() {
        let keyset = KeysetEndpoint {
            jku: "https://example.com".to_string(),
            kid: "123456".to_string(),
        };
        let data = web::Json(keyset);

        let mut app = test::init_service(
            App::new().route(
                "/remove_cached_public_keys",
                web::post().to(remove_cached_public_keys)
            )
        ).await;

        let req = test::TestRequest
            ::post()
            .uri("/remove_cached_public_keys")
            .set_json(&data)
            .to_request();
        let resp = test::call_service(&mut app, req).await;

        assert_eq!(resp.status(), http::StatusCode::OK);
        let body = test::read_body(resp).await;
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["status"], 200);
        assert_eq!(json["status_code"], "COMPLETE");
        assert_eq!(json["status_text"], "Complete remove public keys associated with that keyset");
    }

    #[actix_web::test]
    async fn test_remove_cached_public_keys_without_keyset() {
        let mut app = test::init_service(
            App::new().route(
                "/remove_cached_public_keys",
                web::post().to(remove_cached_public_keys)
            )
        ).await;

        let req = test::TestRequest::post().uri("/remove_cached_public_keys").to_request();
        let resp = test::call_service(&mut app, req).await;

        assert_eq!(resp.status(), http::StatusCode::BAD_REQUEST);
        let body = test::read_body(resp).await;
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["status"], 400);
        assert_eq!(json["status_code"], "NO_PARAMS");
        assert_eq!(json["status_text"], "There is no `jku` & `kid` params");
    }

    #[actix_web::test]
    async fn test_default_service_unauthorized() {
        let mut app = test::init_service(
            App::new().route("/default_service", web::get().to(default_service))
        ).await;

        let req = test::TestRequest::get().uri("/default_service").to_request();
        let resp = test::call_service(&mut app, req).await;

        assert_eq!(resp.status(), http::StatusCode::UNAUTHORIZED);
        let body = test::read_body(resp).await;
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["status"], 401);
        assert_eq!(json["status_code"], "UNAUTHORIZED");
        assert_eq!(json["status_text"], "Unauthorized, please input the correct token");
    }

    #[actix_web::test]
    #[serial]
    async fn test_default_service_forbidden() {
        initialize();
        retrieve_api_key().await;
        let mut app = test::init_service(
            App::new()
                .route("/remove_cached_public_keys", web::get().to(remove_cached_public_keys))
                .default_service(web::get().to(default_service))
        ).await;
        let header_name = HeaderName::from_static("authorization");
        let header_value = HeaderValue::from_static("Basic YXBpXzE6c2VjcmV0X2FwaV8x");

        let client_name = HeaderName::from_bytes("X-zkPass-Client".as_bytes()).unwrap();
        let client_value = HeaderValue::from_static("0.1.0");

        let req = test::TestRequest
            ::get()
            .uri("/default_service")
            .insert_header((header_name, header_value))
            .insert_header((client_name, client_value))
            .to_request();

        let resp = test::call_service(&mut app, req).await;

        assert_eq!(resp.status(), http::StatusCode::FORBIDDEN);
        let body = test::read_body(resp).await;
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["status"], 403);
        assert_eq!(json["status_code"], "FORBIDDEN");
        assert_eq!(
            json["status_text"],
            format!(
                "Please check your zkPass client version. Server version: {}",
                package_version()
            )
        );
    }

    #[actix_web::test]
    #[serial]
    async fn test_default_service_not_found() {
        initialize();
        retrieve_api_key().await;
        let mut app = test::init_service(
            App::new().default_service(web::get().to(default_service))
        ).await;

        let header_name = HeaderName::from_static("authorization");
        let header_value = HeaderValue::from_static("Basic YXBpXzE6c2VjcmV0X2FwaV8x");

        let req = test::TestRequest
            ::get()
            .uri("/not_found")
            .insert_header((header_name, header_value))
            .to_request();

        let resp = test::call_service(&mut app, req).await;

        assert_eq!(resp.status(), http::StatusCode::NOT_FOUND);
        let body = test::read_body(resp).await;
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["status"], 404);
        assert_eq!(json["status_code"], "NOT_FOUND");
        assert_eq!(json["status_text"], "Api / Web you are searching is not found");
    }

    #[actix_web::test]
    #[serial]
    async fn test_get_jwks_success() {
        initialize();
        let mut app = test::init_service(
            App::new().route("/get_jwks", web::get().to(get_jwks))
        ).await;

        let req = test::TestRequest::get().uri("/get_jwks").to_request();
        let resp = test::call_service(&mut app, req).await;

        assert_eq!(resp.status(), http::StatusCode::OK);
        let body = test::read_body(resp).await;
        let jwks: Vec<Jwk> = serde_json::from_slice(&body).unwrap();
        // Add assertions for the expected JSON response

        let service_signing_pub_key = jwks.iter().find(|jwk| jwk.kid == "ServiceSigningPubK");
        let service_encryption_pub_key = jwks.iter().find(|jwk| jwk.kid == "ServiceEncryptionPubK");
        let verifying_pub_key = jwks.iter().find(|jwk| jwk.kid == "VerifyingPubK");

        assert!(service_signing_pub_key.is_some());
        assert!(service_encryption_pub_key.is_some());
        assert!(verifying_pub_key.is_some());
    }
}
