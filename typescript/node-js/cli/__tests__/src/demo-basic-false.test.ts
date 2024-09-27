import { test } from "@jest/globals";
import { assertDemoOutput, runDemoCommand } from "../utils/helper";

test("Demo Basic: False", () => {
  const result = runDemoCommand("npm run demo-basic-false");

  const userDataFilepaths = ["test-data/basic-data-false.json"];
  const dvrFilepath = "test-data/basic-dvr.json";
  const queryResult = false;
  const queryResultOutput = `{ result: ${queryResult} }`;

  assertDemoOutput(
    result,
    userDataFilepaths,
    dvrFilepath,
    queryResult,
    queryResultOutput
  );
});
