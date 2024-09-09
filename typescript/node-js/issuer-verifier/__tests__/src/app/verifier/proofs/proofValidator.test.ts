/*
 * verifier/proofs/proofValidator.test.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { dvrLookup } from "@/app/verifier/dvrs/dvrHelper";
import { MyValidator } from "@/app/verifier/proofs/proofValidator";
import {
  PublicKeyWrapped,
  KeysetEndpointWrapped,
  PublicKey,
} from "@didpass/zkpass-client-ts";

jest.mock("@/app/verifier/dvrs/dvrHelper", () => ({
  dvrLookup: {
    value: {
      getDvr: jest.fn(),
    },
  },
}));

describe("MyValidator", () => {
  let validator: MyValidator;
  const mockDvrPublicKey = {
    dvrVerifyingKey: { PublicKey: "mockPublicKey" },
  };
  const mockDvrKeysetEndpointWrapped = {
    dvrVerifyingKey: {
      KeysetEndpoint: { jku: "mockJku", kid: "mockKid" },
    } as KeysetEndpointWrapped,
  };

  beforeEach(() => {
    validator = new MyValidator();
  });

  test("should validate a valid DVR", async () => {
    (dvrLookup.value.getDvr as jest.Mock).mockReturnValue(mockDvrPublicKey);

    const result = await validator.validate("validDvrId");

    expect(result.expectedDvr).toBe(mockDvrPublicKey);
    expect(result.expectedTtl).toBe(validator.EXPECTED_DVR_TTL);
    expect(result.expectedVerifyingDvrKey).toBe("mockPublicKey");
  });

  test("should throw an error for a non-existent DVR", async () => {
    (dvrLookup.value.getDvr as jest.Mock).mockReturnValue(undefined);

    await expect(validator.validate("nonExistentDvrId")).rejects.toThrow(
      "DVR not found"
    );
  });

  test("should validate a DVR with KeysetEndpointWrapped", async () => {
    (dvrLookup.value.getDvr as jest.Mock).mockReturnValue(
      mockDvrKeysetEndpointWrapped
    );

    const mockPublicKey: PublicKey & { kid: string } = {
      kid: "mockKid",
      x: "mockX",
      y: "mockY",
    };
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ keys: [mockPublicKey] }),
    }) as jest.Mock;

    const result = await validator.validate("dvrWithKeysetEndpointWrapped");

    expect(result.expectedDvr).toBe(mockDvrKeysetEndpointWrapped);
    expect(result.expectedTtl).toBe(validator.EXPECTED_DVR_TTL);
    expect(result.expectedVerifyingDvrKey).toBe(mockPublicKey);
  });

  test("should throw an error if DVR verifying key is not found", async () => {
    (dvrLookup.value.getDvr as jest.Mock).mockReturnValue(
      mockDvrKeysetEndpointWrapped
    );
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ keys: [] }),
    }) as jest.Mock;

    await expect(
      validator.validate("dvrWithInvalidKeysetEndpoint")
    ).rejects.toThrow("DVR verifying key not found");
  });

  test("should throw an error when fetching key", async () => {
    (dvrLookup.value.getDvr as jest.Mock).mockReturnValue(
      mockDvrKeysetEndpointWrapped
    );
    global.fetch = jest.fn().mockResolvedValue({
      json: () => {
        throw new Error("Error Fetching Key");
      },
    }) as jest.Mock;

    await expect(
      validator.validate("dvrWithInvalidKeysetEndpoint")
    ).rejects.toThrow("DVR verifying key not found");
  });
});
