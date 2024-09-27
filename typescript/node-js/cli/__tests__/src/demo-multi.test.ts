import { test } from "@jest/globals";
import { assertDemoOutput, runDemoCommand } from "../utils/helper";

test("Demo Multi", () => {
  const result = runDemoCommand("npm run demo-multi");

  const userDataFilepaths = [
    "test-data/multiple/bank.json",
    "test-data/multiple/health.json",
  ];
  const dvrFilepath = "test-data/multiple/insurance-dvr.json";
  const queryResult = true;
  const queryResultOutput = `{ name: 'Dewi', result: ${queryResult} }`;

  assertDemoOutput(
    result,
    userDataFilepaths,
    dvrFilepath,
    queryResult,
    queryResultOutput
  );
});
