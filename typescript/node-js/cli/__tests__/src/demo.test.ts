import { test } from "@jest/globals";
import { assertContainsNormalizedText, runDemoCommand } from "../utils/helper";

test("Demo", () => {
  const result = runDemoCommand("npm run demo");

  const output = `{ args: [] } required arguments: <data-file>(s) <rules-file>`;
  assertContainsNormalizedText(result, output);
});
