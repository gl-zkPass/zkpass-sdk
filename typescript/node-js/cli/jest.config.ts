import { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  collectCoverageFrom: ["<rootDir>/cli/src/**/*.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  transformIgnorePatterns: ["/node_modules/"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};

export default config;
