import { DIDAccount, QRGenerator } from "@/backend/implementation";
import { IIssuerDetail, QRTypes } from "@/backend/types";

export const didAccount = new DIDAccount(
  "72df9badf16c043fd5e4d87dda2629ddba907576039b80c7eaf3538aec1841ff"
);

describe("QRGenerator class", () => {
  it("should generate a connect QR code", () => {
    const callbackEndpoint = "callback-endpoint-goes-here";
    const issuer: IIssuerDetail = {
      fullName: "issuer-full-name",
      shortName: "issuer-short-name",
      restoreUrl: "issuer-restore-url",
      logo: "issuer-logo",
    };

    const qrCode = new QRGenerator(didAccount).connectQR(
      callbackEndpoint,
      "uuid",
      issuer
    );

    expect(qrCode).toEqual({
      id: "uuid",
      thid: "uuid",
      from: "did:pkh:eip155:1:0xfF367dD64A5d111A13FD9248CCba62b2a155980b",
      typ: "application/json",
      type: QRTypes.TYPE_CONNECT,
      body: {
        reason: "Authentication Request",
        callbackUrl: callbackEndpoint,
        nonce: "nonce",
        issuer,
      },
    });
  });

  it("should generate a connect QR code with param uuid and issuer detail empty", () => {
    const callbackEndpoint = "callback-endpoint-goes-here";

    const qrCode = new QRGenerator(didAccount).connectQR(callbackEndpoint);

    expect(qrCode).toEqual({
      id: "uuid",
      thid: "uuid",
      from: "did:pkh:eip155:1:0xfF367dD64A5d111A13FD9248CCba62b2a155980b",
      typ: "application/json",
      type: QRTypes.TYPE_CONNECT,
      body: {
        reason: "Authentication Request",
        callbackUrl: callbackEndpoint,
        nonce: "nonce",
      },
    });
  });

  it("should generate a credential QR code", () => {
    const callbackEndpoint = "callback-endpoint-goes-here";
    const userDid = "did:pkh:eip155:1:0x1234567890";
    const credentials = [
      {
        id: "credential-id",
        description: "credential-description",
        preview: {
          name: "credential-preview-name",
        },
      },
    ];

    const qrCode = new QRGenerator(didAccount).credentialQR(
      callbackEndpoint,
      userDid,
      credentials
    );

    expect(qrCode).toEqual({
      id: "uuid",
      thid: "uuid",
      from: "did:pkh:eip155:1:0xfF367dD64A5d111A13FD9248CCba62b2a155980b",
      to: userDid,
      typ: "application/json",
      type: QRTypes.TYPE_CREDENTIAL_VC,
      body: {
        credentials,
        callbackUrl: callbackEndpoint,
        nonce: "nonce",
      },
    });
  });
});
