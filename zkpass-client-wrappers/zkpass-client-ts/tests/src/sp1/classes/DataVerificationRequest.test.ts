/*
 * DataVerificationRequest.test.ts
 * Unit tests for DVR Class.
 *
 * Authors:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 * Created at: November 29th 2023
 * -----
 * Last Modified: February 29th 2024
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
import { DataVerificationRequest } from "../../../../src";
import { dvr } from "../../../resources/sp1/variables/sample";
import {
  privateKeyIssuer,
  publicKeyIssuer,
  verifyingKeyJwksIssuer,
} from "../../../resources/sp1/variables/keys";

describe("DataVerificationRequest", () => {
  let dataVerificationRequest: DataVerificationRequest;

  beforeEach(() => {
    dataVerificationRequest = DataVerificationRequest.fromJSON(dvr);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should generate dvr digest", () => {
    const digest = dataVerificationRequest.getSha256Digest();
    expect(digest).toBeDefined();
    expect(typeof digest).toBe("string");
  });

  it("should generate serialized dvr", () => {
    const serialized = dataVerificationRequest.serialize();
    expect(serialized).toBeDefined();
    expect(typeof serialized).toBe("string");
  });

  it("should deserialize dvr", () => {
    const dvrInstance = DataVerificationRequest.deserialize(
      dataVerificationRequest.serialize()
    );
    expect(dvrInstance).toBeDefined();
    expect(dvrInstance).toBeInstanceOf(DataVerificationRequest);
  });

  describe("signToJwsToken", () => {
    it("sign the data to JWS token with verifying key jwks", async () => {
      const jwsToken = await dataVerificationRequest.signToJwsToken(
        privateKeyIssuer,
        verifyingKeyJwksIssuer
      );
      expect(jwsToken).toBeDefined();
      expect(typeof jwsToken).toBe("string");
    });

    it("sign the data to JWS token without verifying key jwks", async () => {
      const jwsToken = await dataVerificationRequest.signToJwsToken(
        privateKeyIssuer
      );
      expect(jwsToken).toBeDefined();
      expect(typeof jwsToken).toBe("string");
    });

    it("should throw error if key is not private key", async () => {
      await expect(
        dataVerificationRequest.signToJwsToken(
          publicKeyIssuer,
          verifyingKeyJwksIssuer
        )
      ).rejects.toThrow(TypeError('"pkcs8" must be PKCS#8 formatted string'));
    });
  });
});
