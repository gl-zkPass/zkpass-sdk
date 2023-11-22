import { JwksEndpoint } from "@/backend/dto";
import { DIDAccount, JwsCredential } from "@/backend/implementation";

jest.mock("../src/implementation/Auth", () => {
  return {
    Auth: jest.fn().mockImplementation(() => {
      return {
        authenticateSignature: jest.fn().mockImplementation(() => {
          return Promise.resolve(true);
        }),
      };
    }),
  };
});

jest.mock("@didpass/zkpass-client-ts", () => {
  return {
    ZkPassClient: jest.fn().mockImplementation(() => {
      return {
        signDataToJwsToken: jest.fn().mockImplementation(() => {
          return Promise.resolve("mockTokenData");
        }),
      };
    }),
  };
});

export const didAccount = new DIDAccount(
  "72df9badf16c043fd5e4d87dda2629ddba907576039b80c7eaf3538aec1841ff"
);

describe("JwsCredential", () => {
  const mockIssuerKeyPem = "mockIssuerKeyPem";
  const mockVerifyingKeyEndpoint = {
    jku: "mockJku",
    kid: "mockKid",
  } as JwksEndpoint;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("tokenizeCredential", () => {
    const mockPayload = {
      issuer: didAccount,
      receiverDID: "mockReceiverDid",
      type: "mockType",
      userData: {
        mockKey: "mockValue",
      } as any,
      message: "mockMessage",
      signature: "mockSignature",
    };

    it("should return a token if the signature is valid", async () => {
      const mockTokenData = "mockTokenData";

      const credential = new JwsCredential(
        mockIssuerKeyPem,
        mockVerifyingKeyEndpoint
      );

      const result = await credential.tokenizeCredential(mockPayload);

      expect(result).toBe(mockTokenData);
    });
  });
});
