/*
 * sample_keys.rs
 * Sample keys for the zkPass Demo
 *
 * ---
 * References:
 *   -
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
pub const ISSUER_PRIVKEY: &str =
    r"-----BEGIN PRIVATE KEY-----
        MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3J/wAlzSD8ZyAU8f
        bPkuCY/BSlq2Y2S5hym8sRccpZehRANCAATt/RChVSxxwH3IzAcBHuhWT8v5mRfx
        moLVnRdNqPcExwyeqH5XN0dlffIYprf66E0CEpZbJ8H+v7cTys9Ie1dd
        -----END PRIVATE KEY-----";

pub const VERIFIER_PRIVKEY: &str =
    r"-----BEGIN PRIVATE KEY-----
        MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
        EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
        PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
        -----END PRIVATE KEY-----";

pub fn issuer_pubkey() -> (String, String) {
    let x = String::from("MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX");
    let y = String::from("8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ==");
    (x, y)
}

pub fn verifier_pubkey() -> (String, String) {
    let x = String::from("MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU");
    let y = String::from("IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==");
    (x, y)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_issuer_pubkey() {
        let (issuer_x, issuer_y) = issuer_pubkey();
        assert_eq!(issuer_x, "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX");
        assert_eq!(issuer_y, "8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ==");
    }

    #[test]
    fn test_verifier_pubkey() {
        let (verifier_x, verifier_y) = verifier_pubkey();
        assert_eq!(verifier_x, "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU");
        assert_eq!(verifier_y, "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==");
    }
}
