/*
 * /v1/generate_proof.rs
 * this file is contains the actual logic to request generate-proof
 * to zkpass-host.
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 30th 2023
 * -----
 * Last Modified: May 2nd 2024
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
use tracing::info;
use zkpass_svc_common::interface::errors::ZkPassSocketError;
use zkpass_svc_common::interface::{
    socket::SocketConnection,
    RequestGenerateProof,
    OPERATION_GENERATE_PROOF,
    OPERATION_SEPARATOR,
};

pub async fn client_generate_proof(
    socket: &mut Box<dyn SocketConnection>,
    request_payload: &RequestGenerateProof
) -> Result<String, ZkPassSocketError> {
    client_request_generate_proof(socket, &request_payload).await?;
    let zkproof = client_process_generate_proof(socket).await?;
    Ok(zkproof)
}

async fn client_request_generate_proof(
    socket: &mut Box<dyn SocketConnection>,
    request_payload: &RequestGenerateProof
) -> Result<(), ZkPassSocketError> {
    let bytes = serde_json
        ::to_string(&request_payload)
        .map_err(|_| ZkPassSocketError::SerializeError("RequestGenerateProof".to_string()))?;
    let payload = format!("{}{}{}", OPERATION_GENERATE_PROOF, OPERATION_SEPARATOR, bytes);
    socket.send(payload)?;
    info!("sending RequestGenerateProof");

    Ok(())
}

async fn client_process_generate_proof(
    socket: &mut Box<dyn SocketConnection>
) -> Result<String, ZkPassSocketError> {
    let zkpass_proof_json = socket.receive()?;
    let zkpass_proof: String = serde_json
        ::from_str(&zkpass_proof_json)
        .map_err(|_| ZkPassSocketError::DeserializeError("ZkPassProof".to_string()))?;
    Ok(zkpass_proof)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::mocks::*;

    #[tokio::test]
    async fn test_client_generate_proof() {
        let dvr_token = "mock_dvr_token".to_string();
        let user_data_token = "mock_user_data_token".to_string();

        let mut socket: Box<dyn SocketConnection> = Box::new(
            MockSocketConnection::new(dvr_token.clone(), user_data_token.clone())
        );
        let request_payload = RequestGenerateProof {
            dvr_token,
            user_data_token,
        };

        let result = client_generate_proof(&mut socket, &request_payload).await;
        assert!(result.is_ok());
        assert!(result.unwrap().contains("mock_proof"));
    }
}
