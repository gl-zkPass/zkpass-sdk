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
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "^jose": require.resolve("jose"),
  },
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { configFile: "next/babel" }],
  },
  transformIgnorePatterns: ["/node_modules/", "\\.pnp\\.[^\\/]+$"],
};

export default config;
