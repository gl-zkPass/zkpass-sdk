/*
 * privacy_app_client.rs
 * Helper struct for calling Privacy App API
 *
 * Authors:
 *   Khandar William (khandar.william@gdplabs.id)
 * Created at: September 5th 2024
 * -----
 * Last Modified: January 17th 2025
 * Modified By: Handrian Alandi (handrian.alandi@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use base64::{ engine::general_purpose, Engine };
use reqwest::{ Method, Response };
use crate::interface::{
    ClientLibError,
    PrivacyAppCredentialsFfi,
    PRIVACY_APP_ERROR_FAILED_TO_DESERIALIZE,
    PRIVACY_APP_ERROR_INVALID_EXPECTED_VALUE,
    PRIVACY_APP_ERROR_REQUEST_TIMEOUT,
};
use serde::{ Serialize, de::DeserializeOwned };
use std::ffi::CStr;
use serde_json::Value;
use tokio::time::{ sleep, Duration };

/// The interval to check the queue item status in milliseconds
const STATUS_CHECK_INTERVAL: u64 = 500;

/// The request timeout for the client to check the queue item status in milliseconds
const REQUEST_TIMEOUT: u64 = 120_000;

/// `PrivacyAppClient` handles Privacy App API authentication and request-response serialization
pub struct PrivacyAppClient {
    pub base_url: String,
    pub api_key: String,
    pub secret_api_key: String,
    // The `using_queue` below is temporary and will be changed later when the client is replaced / added by hitting the queue API
    pub using_queue: bool,
}

impl PrivacyAppClient {
    pub fn from_credentials(credentials: PrivacyAppCredentialsFfi) -> Self {
        let base_url = unsafe {
            CStr::from_ptr(credentials.base_url).to_string_lossy().into_owned()
        };
        let api_key = unsafe { CStr::from_ptr(credentials.api_key).to_string_lossy().into_owned() };
        let secret_api_key = unsafe {
            CStr::from_ptr(credentials.secret_api_key).to_string_lossy().into_owned()
        };

        Self {
            base_url,
            api_key,
            secret_api_key,
            using_queue: credentials.using_queue,
        }
    }

    pub fn get_api_token(&self) -> String {
        let formatted_api_key = format!("{}:{}", self.api_key, self.secret_api_key);
        general_purpose::STANDARD.encode(formatted_api_key)
    }

    async fn send_app_request_internal<Req: Serialize>(
        &self,
        request_url: &str,
        request_method: Method,
        request_body: Option<&Req>
    ) -> Result<Response, ClientLibError> {
        let api_token = self.get_api_token();
        let client = reqwest::Client::new();
        let mut request = client
            .request(request_method, request_url)
            .header("Authorization", format!("Basic {}", api_token));

        if let Some(request_body) = request_body {
            request = request.json(request_body);
        }

        let request = request.send().await?;
        Ok(request)
    }

    /// Send API request to any Privacy App
    /// self.base_url + `path` becomes the full URL, which also contains which Privacy App to target
    pub async fn send_app_request<Req: Serialize, Res: DeserializeOwned>(
        &self,
        path: &str,
        request_body: &Req
    ) -> Result<Res, ClientLibError> {
        // Send the request to the Privacy App API
        let request_url = format!("{}{}", self.base_url, path);
        let http_queue_response = self.send_app_request_internal(
            &request_url,
            Method::POST,
            Some(request_body)
        ).await?;

        // Get the queue ID from the response
        http_response_to_result(http_queue_response, "output").await
    }

    /// Send 2 API request to any Privacy App (Using queue system)
    /// 1. self.base_url + `path` becomes the full URL, which also contains which Privacy App to target
    /// 2. self.base_url + `QUEUE_STATUS_API_PATH` + `{queue_id}` becomes the full URL, which is used to get the queue item status
    ///
    /// `request_body` must be JSON-serializable
    /// The response must be JSON-deserializable
    pub async fn send_app_request_via_queue<Req: Serialize, Res: DeserializeOwned>(
        &self,
        path: &str,
        request_body: &Req
    ) -> Result<Res, ClientLibError> {
        let queue_status_url = self.enqueue_request(path, Some(request_body)).await?;
        self.get_queue_item_status::<Res>(&queue_status_url).await
    }

    async fn enqueue_request<Req: Serialize>(
        &self,
        path: &str,
        request_body: Option<&Req>
    ) -> Result<String, ClientLibError> {
        // Send the request to the Privacy App API
        let request_url = format!("{}{}", self.base_url, path);
        let http_queue_response = self.send_app_request_internal(
            &request_url,
            Method::POST,
            request_body
        ).await?;

        // Get the `queue status url` from the response, that contains the queue ID
        let queue_status_url: String = http_response_to_result(
            http_queue_response,
            "queue_status_url"
        ).await?;
        Ok(queue_status_url)
    }

    async fn get_queue_item_status<Res: DeserializeOwned>(
        &self,
        queue_status_url: &str
    ) -> Result<Res, ClientLibError> {
        let num_of_retries = REQUEST_TIMEOUT / STATUS_CHECK_INTERVAL;

        // Send a loop of requests to the Privacy App API until the queue item is processed / timeout
        for _ in 0..num_of_retries {
            // Convert the HTTP response to the expected result / output
            // If the queue item is:
            // - Success: it will return 200, then return the "output"
            // - Pending / Processing: it will return response code of 202 wait for `TIMEOUT_IN_SECONDS` seconds and retry
            // - Failed: it will return HTTP response based on the correspond ZkPassServiceError.
            match self.get_proof_generation_status::<Res>(&queue_status_url).await {
                Ok(result) => {
                    return Ok(result);
                }
                Err(e) => {
                    match e {
                        ClientLibError::ServerResponsePending(_, _) => {
                            sleep(Duration::from_millis(STATUS_CHECK_INTERVAL)).await;
                            continue;
                        }
                        _ => {
                            return Err(e);
                        }
                    }
                }
            };
        }

        Err(
            ClientLibError::ServerResponseNotOk(
                reqwest::StatusCode::REQUEST_TIMEOUT,
                PRIVACY_APP_ERROR_REQUEST_TIMEOUT.to_string()
            )
        )
    }

    /// Get the queue item current status
    ///
    /// This function will send a request to the Privacy App API to get the queue item status
    /// The response will be parsed into the expected result / output
    pub async fn get_proof_generation_status<Res: DeserializeOwned>(
        &self,
        queue_status_url: &str
    ) -> Result<Res, ClientLibError> {
        let queue_url = format!("{}{}", self.base_url, queue_status_url);
        let http_response = self.send_app_request_internal::<&str>(
            &queue_url,
            Method::GET,
            None
        ).await?;
        http_response_to_result(http_response, "output").await
    }

    // Send a request to the Privacy App API to send generate proof request to the queue
    // and return the queue status url
    pub async fn enqueue_proof_generation_request<Req: Serialize, Res: DeserializeOwned>(
        &self,
        path: &str,
        request_body: &Req
    ) -> Result<String, ClientLibError> {
        let queue_status_url = self.enqueue_request(path, Some(request_body)).await?;
        Ok(queue_status_url)
    }
}

async fn http_response_to_result<Res: DeserializeOwned>(
    response: reqwest::Response,
    expected_key: &str
) -> Result<Res, ClientLibError> {
    let status = response.status();
    let text_response = response.text().await?;

    if status.is_success() {
        let json_value: Value = serde_json::from_str(&text_response)?;
        if let Some(expected_value) = json_value.get(expected_key) {
            let expected_result: Result<Res, _> = serde_json::from_value(expected_value.clone());
            match expected_result {
                Ok(result) => Ok(result),
                Err(_) => {
                    let expected_value_str = expected_value
                        .as_str()
                        .ok_or_else(|| {
                            ClientLibError::ServerResponseNotOk(
                                status,
                                PRIVACY_APP_ERROR_INVALID_EXPECTED_VALUE.to_string()
                            )
                        })?;
                    let expected_string: Res = serde_json
                        ::from_str(&expected_value_str)
                        .map_err(|_| {
                            ClientLibError::ServerResponseNotOk(
                                status,
                                PRIVACY_APP_ERROR_FAILED_TO_DESERIALIZE.to_string()
                            )
                        })?;
                    Ok(expected_string)
                }
            }
        } else {
            Err(ClientLibError::ServerResponsePending(status, text_response))
        }
    } else {
        Err(ClientLibError::ServerResponseNotOk(status, text_response))
    }
}

#[cfg(test)]
mod tests {
    use futures::executor::block_on;
    use http::response::Builder;
    use serde::Deserialize;
    use std::ffi::CString;
    use httpmock::{ Method::{ GET, POST }, MockServer };
    use super::*;

    #[derive(Deserialize)]
    struct ExpectedOutput {
        message: String,
    }

    fn get_credentials(url: &str) -> PrivacyAppCredentialsFfi {
        PrivacyAppCredentialsFfi {
            base_url: CString::new(url).unwrap().into_raw(),
            api_key: CString::new("api_1").unwrap().into_raw(),
            secret_api_key: CString::new("secret_api_1").unwrap().into_raw(),
            using_queue: false,
        }
    }

    #[test]
    fn test_privacy_app_client_credentials() {
        let credentials = get_credentials("http://localhost:10888/api");
        let privacy_app_client = PrivacyAppClient::from_credentials(credentials);
        assert_eq!(privacy_app_client.base_url, "http://localhost:10888/api");
        assert_eq!(privacy_app_client.api_key, "api_1");
        assert_eq!(privacy_app_client.secret_api_key, "secret_api_1");
        assert_eq!(privacy_app_client.get_api_token(), "YXBpXzE6c2VjcmV0X2FwaV8x");
    }

    #[test]
    fn test_http_response_to_result_success() {
        let http_response = Builder::new()
            .status(200)
            .body(r#"{"status": 200, "output": "{\"message\":\"hello world\"}"}"#)
            .unwrap();
        let response = reqwest::Response::from(http_response);

        let result: ExpectedOutput = block_on(http_response_to_result(response, "output")).unwrap();
        assert_eq!(result.message, "hello world");

        // success but output is not correct JSON (no output field)
        let http_response = Builder::new()
            .status(200)
            .body(r#"{"status": 200, "not_output": "hello world"#)
            .unwrap();
        let response = reqwest::Response::from(http_response);
        let result: Result<ExpectedOutput, _> = block_on(
            http_response_to_result(response, "output")
        );
        assert!(result.is_err());

        // success but output is not correct JSON (not expected output struct)
        let http_response = Builder::new()
            .status(200)
            .body(r#"{"status": 200, "output": "hello world"#)
            .unwrap();
        let response = reqwest::Response::from(http_response);
        let result: Result<ExpectedOutput, _> = block_on(
            http_response_to_result(response, "output")
        );
        assert!(result.is_err());
    }

    #[test]
    fn test_http_response_to_result_non_json() {
        let http_response = Builder::new()
            .status(200)
            .body(r#"{"status": 200, "output": "some_string_output"}"#)
            .unwrap();
        let response = reqwest::Response::from(http_response);

        let result: String = block_on(http_response_to_result(response, "output")).unwrap();
        assert_eq!(result, "some_string_output");
    }

    #[test]
    fn test_http_response_to_result_error() {
        let http_response = Builder::new().status(400).body("Bad Request").unwrap();
        let response = reqwest::Response::from(http_response);

        let error = block_on(http_response_to_result::<String>(response, "output"));
        assert!(error.is_err());

        let err: &dyn std::error::Error = &error.unwrap_err();
        assert!(err.source().is_none());
    }

    #[tokio::test]
    async fn test_send_app_request() {
        const TEST_ENDPOINT: &str = "/api/test";
        let server = MockServer::start();
        server.mock(|when, then| {
            when.method(POST).path(TEST_ENDPOINT);
            then.status(200).body(r#"{"status": 200, "output": "{\"message\":\"hello world\"}"}"#);
        });
        let base_url = format!("http://{}/api", server.address());
        let credentials = PrivacyAppCredentialsFfi {
            base_url: CString::new(base_url).unwrap().into_raw(),
            api_key: CString::new("api_1").unwrap().into_raw(),
            secret_api_key: CString::new("secret_api_1").unwrap().into_raw(),
            using_queue: false,
        };

        let privacy_app_client = PrivacyAppClient::from_credentials(credentials);
        let path = "/test";
        let request_body = serde_json::json!({ "message": "hello world" });
        let response = privacy_app_client.send_app_request::<_, ExpectedOutput>(
            path,
            &request_body
        ).await;
        assert!(response.is_ok());
        assert_eq!(response.unwrap().message, "hello world");
        let path = "/not-found";
        let response = privacy_app_client.send_app_request::<_, ExpectedOutput>(
            path,
            &request_body
        ).await;
        assert!(response.is_err());
    }

    #[tokio::test]
    async fn test_send_app_request_via_queue() {
        const TEST_ENDPOINT: &str = "/api/test";
        const TEST_QUEUE_ENDPOINT: &str = "/api/status/1234567890";
        let server = MockServer::start();
        server.mock(|when, then| {
            when.method(POST).path(TEST_ENDPOINT);
            then.status(202).body(r#"{"status":202,"queue_status_url":"/api/status/1234567890"}"#);
        });
        server.mock(|when, then| {
            when.method(GET).path(TEST_QUEUE_ENDPOINT);
            then.status(200).body(r#"{"status": 200, "output": "{\"message\":\"hello world\"}"}"#);
        });
        let base_url = format!("http://{}", server.address());
        let credentials = get_credentials(&base_url);

        let privacy_app_client = PrivacyAppClient::from_credentials(credentials);
        let path = "/api/test";
        let request_body = serde_json::json!({ "message": "hello world" });
        let response = privacy_app_client.send_app_request_via_queue::<_, ExpectedOutput>(
            path,
            &request_body
        ).await;
        assert!(response.is_ok());
        assert_eq!(response.unwrap().message, "hello world");

        let path = "/not-found";
        let response = privacy_app_client.send_app_request_via_queue::<_, ExpectedOutput>(
            path,
            &request_body
        ).await;
        assert!(response.is_err());
    }

    #[tokio::test]
    async fn test_request_and_get_queue_id_failed() {
        const TEST_ENDPOINT: &str = "/api/test";
        let server = MockServer::start();
        // queue_id not found
        server.mock(|when, then| {
            when.method(POST).path(TEST_ENDPOINT);
            then.status(202).body(r#"{"status":202,"not_queue_id":"1234567890"}"#);
        });

        let base_url = format!("http://{}/api", server.address());
        let credentials = get_credentials(&base_url);

        let privacy_app_client = PrivacyAppClient::from_credentials(credentials);
        let response = privacy_app_client.enqueue_request::<String>(TEST_ENDPOINT, None).await;
        assert!(response.is_err());

        // Status is not success
        server.mock(|when, then| {
            when.method(POST).path(TEST_ENDPOINT);
            then.status(500).body(r#"{"status":500,"not_queue_id":"1234567890"}"#);
        });
        let response = privacy_app_client.enqueue_request::<String>(TEST_ENDPOINT, None).await;
        assert!(response.is_err());
    }

    #[tokio::test]
    async fn test_get_queue_item_status_failed() {
        const TEST_QUEUE_ENDPOINT: &str = "/api/status/1234567890";
        let server = MockServer::start();
        server.mock(|when, then| {
            when.method(POST).path(TEST_QUEUE_ENDPOINT);
            then.status(202).body(r#"{"status": 202, "status_code": "PENDING"}"#);
        });
        server.mock(|when, then| {
            when.method(POST).path(TEST_QUEUE_ENDPOINT);
            then.status(500).body(r#"{"status": 500, "status_code": "FAILED"}"#);
        });
        let base_url = format!("http://{}/api", server.address());
        let credentials = get_credentials(&base_url);

        let privacy_app_client = PrivacyAppClient::from_credentials(credentials);
        let queue_id = "1234567890";
        let response = privacy_app_client.get_queue_item_status::<String>(queue_id).await;
        assert!(response.is_err());
    }
}
