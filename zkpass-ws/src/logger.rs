/*
 * logger.rs
 * This file consists of middleware implementation for logging API access, including
 * authorization headers and latency information.
 *
 * Authors:
 *   Janice Laksana (janice.laksana@gdplabs.id)
 * Created Date: January 9th 2024
 * -----
 * Last Modified: January 29th 2024
 * Modified By:
 *   Janice Laksana (janice.laksana@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   Khandar William (khandar.william@gdplabs.id)
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * ---
 * References:
 *   [1] https://docs.rs/actix-web/latest/actix_web/middleware/index.html
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

use actix_web::{ dev::{ Service, ServiceRequest, ServiceResponse, Transform }, Error };
use std::{ future::{ ready, Ready, Future }, pin::Pin, task::{ Context, Poll }, time::Instant };
use tracing::info;
use base64::{ engine::general_purpose::STANDARD, Engine };

pub struct Logger;

impl<S, B> Transform<S, ServiceRequest>
    for Logger
    where
        S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
        S::Future: 'static,
        B: 'static
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = LoggerMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(LoggerMiddleware { service }))
    }
}

pub struct LoggerMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest>
    for LoggerMiddleware<S>
    where
        S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
        S::Future: 'static,
        B: 'static
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let start_time = Instant::now();
        let auth_header = extract_auth_header(&req);
        let endpoint = req.path().to_string();
        let ip = req.connection_info().realip_remote_addr().unwrap_or("127.0.0.1").to_string();

        let fut = self.service.call(req);
        Box::pin(async move {
            match fut.await {
                Ok(res) => {
                    log_request(&auth_header, &ip, &endpoint, start_time.elapsed().as_millis(), "");
                    Ok(res)
                }
                Err(err) => {
                    log_request(
                        &auth_header,
                        &ip,
                        &endpoint,
                        start_time.elapsed().as_millis(),
                        &err.to_string()
                    );
                    Err(err)
                }
            }
        })
    }
}

fn extract_auth_header(req: &ServiceRequest) -> String {
    req.headers()
        .get("Authorization")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("")
        .to_string()
}

fn log_request(auth_header: &str, ip: &str, endpoint: &str, latency: u128, error: &str) {
    if let Some(api_key) = auth_header.strip_prefix("Basic ").and_then(extract_api_key) {
        let response_message: String = if error.is_empty() {
            "Request Success".to_owned()
        } else {
            format!("Error Processing Request: {}", error)
        };

        info!("[API-USAGE] {} {} {} {} ms {}", ip, api_key, endpoint, latency, response_message);
    }
}

pub fn write_host_log(msg: String) {
    info!("HOST LOG: {}", msg)
}

fn extract_api_key(encoded_key: &str) -> Option<String> {
    STANDARD.decode(encoded_key)
        .ok()
        .and_then(|decoded| String::from_utf8(decoded).ok())
        .and_then(|decoded_str| {
            let parts: Vec<&str> = decoded_str.splitn(2, ':').collect();
            parts.get(0).map(|&key| key.to_string())
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_api_key_valid() {
        let encoded_key = "QWxhZGRpbjpvcGVuIHNlc2FtZQ=="; // "Aladdin:open sesame"
        assert_eq!(extract_api_key(encoded_key), Some("Aladdin".to_string()));
    }

    #[test]
    fn test_extract_api_key_invalid() {
        let encoded_key = "InvalidKey";
        assert_eq!(extract_api_key(encoded_key), None);
    }
}
