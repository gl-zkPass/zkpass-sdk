import { test } from "@jest/globals";
import { assertDemoOutput, runDemoCommand } from "../utils/helper";

test("Demo Dewi", () => {
  const result = runDemoCommand("npm run demo-dewi");

  const userDataFilepaths = ["test-data/dewi-profile-wrong.json"];
  const dvrFilepath = "test-data/bca-insurance-dewi-dvr.json";
  const queryResult = false;
  const queryResultOutput = `{ name: 'Dewi', result: ${queryResult} }`;

  assertDemoOutput(
    result,
    userDataFilepaths,
    dvrFilepath,
    queryResult,
    queryResultOutput
  );
});
