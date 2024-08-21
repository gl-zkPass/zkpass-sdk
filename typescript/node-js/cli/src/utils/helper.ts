/*
 * helper.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
interface UserDataTag {
  [key: string]: string;
}

const readUserDataFromArgs = (args: string[]): string[] => {
  return args.slice(0, args.length - 1);
};

const getTagsFromArgs = (args: string[]): string[] => {
  const tags: string[] = args.map(
    (dataFile) =>
      dataFile
        .split(".")
        [dataFile.split(".").length - 2].split("/")
        .pop() as string
  );
  return tags;
};

export { readUserDataFromArgs, getTagsFromArgs };
export type { UserDataTag };
