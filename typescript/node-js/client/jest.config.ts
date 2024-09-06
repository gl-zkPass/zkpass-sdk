import { Config } from "jest";

const config: Config = {
  automock: false,
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!**/node_modules/**",
    "!**/vendor/**",
  ],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "^@/(.*)$": ["<rootDir>/src/$1"],
    "^@components/(.*)$": ["<rootDir>/src/components/$1"],
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|jpg|png)$": "<rootDir>/__mocks__/imageMock.ts",
    "^jose": require.resolve("jose"),
  },
  modulePathIgnorePatterns: [
    "<rootDir>/e2e-test/",
    "<rootDir>/__tests__/test-utils",
  ],
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { configFile: "next/babel" }],
  },
  transformIgnorePatterns: ["/node_modules/", "\\.pnp\\.[^\\/]+$"],
};

export default config;
