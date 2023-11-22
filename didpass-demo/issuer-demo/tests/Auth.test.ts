import { Auth } from "@/backend/implementation";
import { SiweMessage } from "siwe";

jest.mock("siwe", () => ({
  SiweMessage: jest.fn(),
}));

describe("Auth class", () => {
  it("should authenticate signature successfully", async () => {
    const message = "message-goes-here";
    const signature = "signature-goes-here";

    (SiweMessage as jest.Mock).mockImplementation(() => ({
      verify: () => Promise.resolve({ success: true }),
    }));

    const auth = new Auth();
    const isAuthenticated = await auth.authenticateSignature(
      message,
      signature
    );

    expect(isAuthenticated).toBe(true);
  });

  it("should fail authentication if signature verification fails", async () => {
    const message = "message-goes-here";
    const signature = "signature-goes-here";

    (SiweMessage as jest.Mock).mockImplementation(() => ({
      verify: () => Promise.reject(new Error("Verification failed")),
    }));

    const auth = new Auth();
    const isAuthenticated = await auth.authenticateSignature(
      message,
      signature
    );

    expect(isAuthenticated).toBe(false);
  });
});
