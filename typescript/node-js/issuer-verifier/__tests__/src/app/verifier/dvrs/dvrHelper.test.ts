/*
 * verifier/dvrs/dvrHelper.test.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { dvrLookup } from "@/app/verifier/dvrs/dvrHelper";
import { DataVerificationRequest } from "@didpass/zkpass-client-ts";

jest.mock("@didpass/zkpass-client-ts", () => ({
  DataVerificationRequest: jest.fn().mockImplementation(() => ({
    zkVm: "",
    dvrTitle: "",
    dvrId: "",
    queryEngineVer: "",
    queryMethodVer: "",
    query: "",
    userDataRequests: {},
    dvrVerifyingKey: null,
  })),
}));

describe("DvrHelper", () => {
  const mockDvr: DataVerificationRequest = {
    zkVm: "r0",
    dvrTitle: "mockTitle",
    dvrId: "mockId",
    queryEngineVer: "mockQueryEngineVersion",
    queryMethodVer: "mockQueryMethodVersion",
    query: "mockPaymentQuery",
    userDataRequests: {
      "": {
        user_data_url: "http://example.com",
        user_data_verifying_key: {
          KeysetEndpoint: {
            jku: "",
            kid: "",
          },
        },
      },
    },
    dvrVerifyingKey: {
      KeysetEndpoint: {
        jku: "",
        kid: "",
      },
    },
    serialize: jest.fn(),
    serializeJson: jest.fn(),
    getSha256Digest: jest.fn(),
    signToJwsToken: jest.fn(),
  };

  beforeEach(() => {
    dvrLookup.value = new (dvrLookup.value.constructor as any)();
  });

  it("should add a DVR to the lookup table", () => {
    dvrLookup.value.addDvr(mockDvr);
    expect(dvrLookup.value.getDvr("mockId")).toEqual(mockDvr);
  });

  it("should retrieve and remove a DVR from the lookup table", () => {
    dvrLookup.value.addDvr(mockDvr);

    const retrievedData = dvrLookup.value.getDvr("mockId");
    expect(retrievedData).toEqual(mockDvr);
    expect(dvrLookup.value.getDvr("mockId")).toBeUndefined();
  });

  it("should return undefined for a non-existent DVR", () => {
    expect(dvrLookup.value.getDvr("something-key")).toBeUndefined();
  });
});

describe("dvrLookup global instance", () => {
  it("should create a single instance of DvrLookup and reuse it", () => {
    jest.resetModules();
    const { dvrLookup } = require("@/app/verifier/dvrs/dvrHelper");

    const firstInstance = dvrLookup.value;
    const secondInstance = dvrLookup.value;
    expect(firstInstance).toBeDefined();
    expect(secondInstance).toBeDefined();
    expect(firstInstance).toBe(secondInstance);
  });
});
