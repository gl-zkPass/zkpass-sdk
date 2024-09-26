import { test } from "@jest/globals";
import { assertDemoOutput, runDemoCommand } from "../utils/helper";

test("Demo Ramana", () => {
  const result = runDemoCommand("npm run demo-ramana");

  const userDataFilepaths = ["test-data/ramana-profile.json"];
  const dvrFilepath = "test-data/bca-finance-ramana-dvr.json";
  const queryResult = true;
  const queryResultOutput = `{ title: 'Loan Query Results', result: ${queryResult}, name: 'Ramana' }`;

  assertDemoOutput(
    result,
    userDataFilepaths,
    dvrFilepath,
    queryResult,
    queryResultOutput
  );
});
