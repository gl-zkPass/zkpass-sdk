// constants.rs
use zkpass_client::core::PublicKey;

pub const API_KEY: &str = "e7fd7ec9-33b2-4f33-a383-c2f1d151a7c2";
pub const SECRET_API_KEY: &str = "6a79ffa2-5fe8-4764-8edf-0ebc5dbcccf9";
pub const ZKPASS_URL: &str = "https://staging-zkpass.ssi.id";

// sample key, don't use this key in production
pub const ISSUER_PRIVKEY: &str = r"-----BEGIN PRIVATE KEY-----
        MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3J/wAlzSD8ZyAU8f
        bPkuCY/BSlq2Y2S5hym8sRccpZehRANCAATt/RChVSxxwH3IzAcBHuhWT8v5mRfx
        moLVnRdNqPcExwyeqH5XN0dlffIYprf66E0CEpZbJ8H+v7cTys9Ie1dd
        -----END PRIVATE KEY-----";
pub const VERIFIER_PRIVKEY: &str = r"-----BEGIN PRIVATE KEY-----
        MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
        EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
        PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
        -----END PRIVATE KEY-----";

pub fn issuer_pubkey() -> PublicKey {
    PublicKey {
        x: String::from("MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX"),
        y: String::from("8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ=="),
    }
}

pub fn verifier_pubkey() -> PublicKey {
    PublicKey {
        x: String::from("MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU"),
        y: String::from("IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA=="),
    }
}
