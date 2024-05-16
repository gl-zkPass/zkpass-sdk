/*
 * keys.ts
 * Mocked Keys to be used for encryption, decryption, sign, and verify.
 *
 * Authors:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: November 28th 2023
 * -----
 * Last Modified: April 19th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

const publicKeyVerifier =
  '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU\nIT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==\n-----END PUBLIC KEY-----';

const privateKeyVerifier =
  '-----BEGIN PRIVATE KEY-----\n' +
  'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C\n' +
  'EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh\n' +
  'PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4\n' +
  '-----END PRIVATE KEY-----';

const publicKeyIssuer =
  '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX\n8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ==\n-----END PUBLIC KEY-----';
const privateKeyIssuer =
  '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3J/wAlzSD8ZyAU8f\nbPkuCY/BSlq2Y2S5hym8sRccpZehRANCAATt/RChVSxxwH3IzAcBHuhWT8v5mRfx\nmoLVnRdNqPcExwyeqH5XN0dlffIYprf66E0CEpZbJ8H+v7cTys9Ie1dd\n-----END PRIVATE KEY-----';

const verifyingKeyJwksIssuer = {
  jku: 'https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/issuer-key.json',
  kid: 'k-1',
};
const verifyingKeyJwksVerifier = {
  jku: 'https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/verifier-key.json',
  kid: 'k-1',
};

const zkPassServiceKeys = [
  {
    kty: 'EC',
    crv: 'P-256',
    x: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU',
    y: 'IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==',
    kid: 'ServiceSigningPubK',
    jwt: 'eyJhbGciOiJFUzI1NiJ9.eyJ4IjoiTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFcDZXSmx3QXRsZC9VNGhEbW11dU1kWkNWdE1lVSIsInkiOiJJVDN4a0RkVXdMT3ZzVlZBK2lpU3dmYVg0SHFLbFJQREdHK0Y2V0dqbnh5czlUNUd0TmUzbnZld09BPT0ifQ.pVOBooPoKdZVBfTuQ_codQg5C4YbhwFWiGvZ2nrosRbCUfDHRv9r747DCY7Hl0LDaqW0htGnPcobLY4GMatfqQ',
  },
  {
    kty: 'EC',
    crv: 'P-256',
    x: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU',
    y: 'IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==',
    kid: 'ServiceEncryptionPubK',
    jwt: 'eyJhbGciOiJFUzI1NiJ9.eyJ4IjoiTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFcDZXSmx3QXRsZC9VNGhEbW11dU1kWkNWdE1lVSIsInkiOiJJVDN4a0RkVXdMT3ZzVlZBK2lpU3dmYVg0SHFLbFJQREdHK0Y2V0dqbnh5czlUNUd0TmUzbnZld09BPT0ifQ.JiYyxmDjNk_FEwIyscWHPWEji2ROjVlhPKJIkqlsxRB4JyY0z3xzXdZGW4wXf-2UdqiSu2yFEOh1t8lRnt-DqA',
  },
  {
    kty: 'EC',
    crv: 'P-256',
    x: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGI0BnWm1eMGnX3aVt6vevBjfkZ2N',
    y: 'EfzRy1giqA6Tg1cecU60fkNxOjkFwxZeU0tO7TAfjUvAYyvbfNKdAOfrOA==',
    kid: 'VerifyingPubK',
  },
];

export {
  publicKeyVerifier,
  privateKeyVerifier,
  publicKeyIssuer,
  privateKeyIssuer,
  verifyingKeyJwksIssuer,
  verifyingKeyJwksVerifier,
  zkPassServiceKeys,
};
