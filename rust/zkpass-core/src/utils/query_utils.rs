use jsonwebtoken::{ decode, DecodingKey, Validation };
use serde::{ Deserialize, Serialize };
use crate::dvr_app::interface::ZkPassProof;

#[derive(Serialize, Deserialize)]
struct WrappedZkPassProof {
    pub data: ZkPassProof,
}

pub fn decode_zkproof(proof_token: &str) -> String {
    let decoding_key = DecodingKey::from_secret(&[]);
    let mut validation = Validation::default();
    validation.insecure_disable_signature_validation();
    validation.set_required_spec_claims(&["data"]);

    let zkproof_wrapped = decode::<WrappedZkPassProof>(
        proof_token,
        &decoding_key,
        &validation
    ).unwrap();
    zkproof_wrapped.claims.data.zkproof
}
