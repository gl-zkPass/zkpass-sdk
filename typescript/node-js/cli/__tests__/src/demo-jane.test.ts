import { test } from "@jest/globals";
import { assertDemoOutput, runDemoCommand } from "../utils/helper";

test("Demo Jane", () => {
  const result = runDemoCommand("npm run demo-jane");

  const userDataFilepaths = ["test-data/jane-blood-test-result.json"];
  const dvrFilepath = "test-data/employee-onboarding-dvr.json";
  const queryResult = true;
  const queryResultOutput = `{ name: 'Jane', email: 'jane.doe@gmail.com', result: ${queryResult} }`;

  assertDemoOutput(
    result,
    userDataFilepaths,
    dvrFilepath,
    queryResult,
    queryResultOutput
  );
});
