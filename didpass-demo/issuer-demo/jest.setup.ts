import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";
require("jest-fetch-mock").enableMocks();

jest.doMock("@spruceid/didkit-wasm-node", () =>
  jest.requireActual("./tests/__mocks__/didkit")
);

jest.mock("siwe", () => {
  return {
    SiweMessage: jest.fn().mockImplementation(() => ({
      verify: (signature: string) => {
        if (signature === "invalid-signature") {
          return Promise.reject(new Error("Verification failed"));
        }

        return Promise.resolve({ success: true });
      },
    })),
    generateNonce: jest.fn().mockReturnValue("nonce"),
  };
});

jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("uuid"),
}));
