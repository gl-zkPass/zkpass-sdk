import { test } from "@jest/globals";
import { assertDemoOutput, runDemoCommand } from "../utils/helper";

test("Demo Basic: True", () => {
  const result = runDemoCommand("npm run demo-basic");

  const userDataFilepaths = ["test-data/basic-data.json"];
  const dvrFilepath = "test-data/basic-dvr.json";
  const queryResult = true;
  const queryResultOutput = `{ result: ${queryResult} }`;

  assertDemoOutput(
    result,
    userDataFilepaths,
    dvrFilepath,
    queryResult,
    queryResultOutput
  );
});
