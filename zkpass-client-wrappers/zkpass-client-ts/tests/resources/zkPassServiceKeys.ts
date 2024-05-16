/*
 * zkPassServiceKeys.ts
 * Keys mock values.
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: March 4th 2024
 * -----
 * Last Modified: March 4th 2024
 * Modified By: GDPWinnerPranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 *   zulamdat (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

export const ZKPASS_SERVICE_KEYS = [
  {
    kty: "EC",
    crv: "P-256",
    x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU",
    y: "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==",
    kid: "ServiceSigningPubK",
    jwt: "eyJhbGciOiJFUzI1NiJ9.eyJ4IjoiTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFcDZXSmx3QXRsZC9VNGhEbW11dU1kWkNWdE1lVSIsInkiOiJJVDN4a0RkVXdMT3ZzVlZBK2lpU3dmYVg0SHFLbFJQREdHK0Y2V0dqbnh5czlUNUd0TmUzbnZld09BPT0ifQ.pVOBooPoKdZVBfTuQ_codQg5C4YbhwFWiGvZ2nrosRbCUfDHRv9r747DCY7Hl0LDaqW0htGnPcobLY4GMatfqQ",
  },
  {
    kty: "EC",
    crv: "P-256",
    x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU",
    y: "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==",
    kid: "ServiceEncryptionPubK",
    jwt: "eyJhbGciOiJFUzI1NiJ9.eyJ4IjoiTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFcDZXSmx3QXRsZC9VNGhEbW11dU1kWkNWdE1lVSIsInkiOiJJVDN4a0RkVXdMT3ZzVlZBK2lpU3dmYVg0SHFLbFJQREdHK0Y2V0dqbnh5czlUNUd0TmUzbnZld09BPT0ifQ.JiYyxmDjNk_FEwIyscWHPWEji2ROjVlhPKJIkqlsxRB4JyY0z3xzXdZGW4wXf-2UdqiSu2yFEOh1t8lRnt-DqA",
  },
  {
    kty: "EC",
    crv: "P-256",
    x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGI0BnWm1eMGnX3aVt6vevBjfkZ2N",
    y: "EfzRy1giqA6Tg1cecU60fkNxOjkFwxZeU0tO7TAfjUvAYyvbfNKdAOfrOA==",
    kid: "VerifyingPubK",
  },
];
