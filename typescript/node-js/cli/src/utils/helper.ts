/*
 * helper.ts
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: August 19th 2024
 * -----
 * Last Modified: August 20th 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *
 * ---
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
