import { expect } from "@jest/globals";
import fs from "fs";
const { execSync } = require("child_process");

function normalizeString(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function readAndNormalizeFile(filePath: string): string {
  const data = fs.readFileSync(filePath, "utf8");
  return normalizeString(data);
}

export function runDemoCommand(command: string): string {
  const result = execSync(command).toString();
  return normalizeString(result);
}

function extractFileName(filePath: string): string {
  const match = filePath.match(/\/([^\/]+)\.json$/);
  return match ? match[1] : "";
}

export function assertContainsNormalizedText(result: string, text: string) {
  expect(result).toContain(normalizeString(text));
}

export function assertDemoOutput(
  result: string,
  userDataFilepaths: string[],
  dvrFilepath: string,
  queryResult: boolean,
  queryResultOutput: string
): void {
  const args = generateArgsText(userDataFilepaths, dvrFilepath);
  assertContainsNormalizedText(result, args);

  for (const userDataFilepath of userDataFilepaths) {
    const userDataName = extractFileName(userDataFilepath);
    const userData = readAndNormalizeFile(userDataFilepath);
    assertContainsNormalizedText(result, `data ${userDataName}=${userData}`);
  }

  const dvr = readAndNormalizeFile(dvrFilepath);
  assertContainsNormalizedText(result, `query=${dvr}`);

  const generationText = `#### starting zkPass proof generation... #### generation completed`;
  assertContainsNormalizedText(result, generationText);

  const verificationText = `#### starting zkPass proof verification... #### verification completed`;
  assertContainsNormalizedText(result, verificationText);

  const queryResultText = `the query result is ${queryResult} ${queryResultOutput}`;
  assertContainsNormalizedText(result, queryResultText);
}

function generateArgsText(
  userDataFilepaths: string[],
  dvrFilepath: string
): string {
  let args = "{ args: [ ";
  for (const userDataFilepath of userDataFilepaths) {
    args += `'./${userDataFilepath}', `;
  }
  args += `'./${dvrFilepath}' ] }`;
  return args;
}
