/*
 * privacy_app_client.rs
 * Helper struct for calling Privacy App API
 *
 * Authors:
 * Created at: September 5th 2024
 * -----
 * Last Modified: November 7th 2024
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use base64::{ engine::general_purpose, Engine };
use crate::interface::{ ClientLibError, PrivacyAppCredentialsFfi, PrivacyAppResult };
use serde::{ Serialize, de::DeserializeOwned };
use std::ffi::CStr;
use serde_json::Value;

/// `PrivacyAppClient` handles Privacy App API authentication and request-response serialization
pub struct PrivacyAppClient {
    pub base_url: String,
    pub api_key: String,
    pub secret_api_key: String,
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
        }
    }

    pub fn get_api_token(&self) -> String {
        let formatted_api_key = format!("{}:{}", self.api_key, self.secret_api_key);
        general_purpose::STANDARD.encode(formatted_api_key)
    }

    /// Send API request to any Privacy App
    /// self.base_url + `path` becomes the full URL, which also contains which Privacy App to target
    /// `request_body` must be JSON-serializable
    /// The response must be JSON-deserializable
    pub async fn send_app_request<Req: Serialize, Res: DeserializeOwned>(
        &self,
        path: &str,
        request_body: &Req
    ) -> Result<Res, ClientLibError> {
        let request_url = format!("{}{}", self.base_url, path);
        let api_token = self.get_api_token();

        let client = reqwest::Client::new();
        let http_response = client
            .post(&request_url)
            .header("Authorization", format!("Basic {}", api_token))
            .json(request_body)
            .send().await?;

        http_response_to_result(http_response).await
    }
}

async fn http_response_to_result<Res: DeserializeOwned>(
    response: reqwest::Response
) -> Result<Res, ClientLibError> {
    let status = response.status();
    let text_response = response.text().await?;

    if status.is_success() {
        let app_result: PrivacyAppResult = serde_json::from_str(&text_response)?;

        let res: Result<Res, _> = serde_json::from_str(&app_result.output);
        match res {
            Ok(result) => Ok(result),
            Err(_) => {
                // It handles the case where the output is not a JSON string
                let res: Res = serde_json::from_value(Value::String(app_result.output))?;
                Ok(res)
            }
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
    use httpmock::{ Method::POST, MockServer };
    use super::*;

    #[derive(Deserialize)]
    struct ExpectedOutput {
        message: String,
    }

    #[test]
    fn test_privacy_app_client_credentials() {
        let credentials = PrivacyAppCredentialsFfi {
            base_url: CString::new("http://localhost:10888/api").unwrap().into_raw(),
            api_key: CString::new("api_1").unwrap().into_raw(),
            secret_api_key: CString::new("secret_api_1").unwrap().into_raw(),
        };

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

        let result: ExpectedOutput = block_on(http_response_to_result(response)).unwrap();
        assert_eq!(result.message, "hello world");

        // success but output is not correct JSON (no output field)
        let http_response = Builder::new()
            .status(200)
            .body(r#"{"status": 200, "not_output": "hello world"#)
            .unwrap();
        let response = reqwest::Response::from(http_response);
        let result: Result<ExpectedOutput, _> = block_on(http_response_to_result(response));
        assert!(result.is_err());

        // success but output is not correct JSON (not expected output struct)
        let http_response = Builder::new()
            .status(200)
            .body(r#"{"status": 200, "output": "hello world"#)
            .unwrap();
        let response = reqwest::Response::from(http_response);
        let result: Result<ExpectedOutput, _> = block_on(http_response_to_result(response));
        assert!(result.is_err());
    }

    #[test]
    fn test_http_response_to_result_non_json() {
        let http_response = Builder::new()
            .status(200)
            .body(r#"{"status": 200, "output": "some_string_output"}"#)
            .unwrap();
        let response = reqwest::Response::from(http_response);

        let result: String = block_on(http_response_to_result(response)).unwrap();
        assert_eq!(result, "some_string_output");
    }

    #[test]
    fn test_http_response_to_result_error() {
        let http_response = Builder::new().status(400).body("Bad Request").unwrap();
        let response = reqwest::Response::from(http_response);

        let error = block_on(http_response_to_result::<String>(response));
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
}
