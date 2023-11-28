/*
 * index.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 27th 2023
 * -----
 * Last Modified: November 28th 2023
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   Nugraha Tejapermana (nugraha.tejapermana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { DataHolder } from "./dataHolder";

function runDataHolder(dataFile: string, dvrFile: string): void {
  try {
    const dataHolder = new DataHolder();
    dataHolder.start(dataFile, dvrFile);
  } catch (error) {
    console.log("=== runDataHolder: error ===");
    console.log({ error });
  }
}

function main(): void {
  const args: string[] = process.argv.slice(2);
  console.log("=== main ===");
  console.log({ args });
  if (args.length === 2) {
    runDataHolder(args[0], args[1]);
  } else {
    console.log("required arguments: <data-file> <rules-file>");
  }
}

main();
