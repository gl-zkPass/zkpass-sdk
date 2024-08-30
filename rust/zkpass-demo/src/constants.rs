// constants.rs
use zkpass_client::core::PublicKey;

pub const API_KEY: &str = "5ecb2229-ddee-460e-b598-a0001c10fff1";
pub const SECRET_API_KEY: &str = "074a53a8-a252-45de-a9d5-0961a6362df6";
pub const ZKPASS_URL: &str = "https://playground-zkpass.ssi.id";

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
