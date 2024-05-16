/*
 * bundler.ts
 *
 * Authors:
 *   Winner Pranata (winner.pranata@gdplabs.id)
 * Created at: February 20th 2024
 * -----
 * Modified at: February 28th 2024
 * Modified By: Winner Pranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   khandar-william
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { FilePayload } from "./common/postAction";
import { Generator, Cryptor, Signer, PostActionable } from "./interfaces";
import { KmsGenerator } from "./kms";
import { NativeGenerator } from "./native";

export const OPERATION_BUNDLE: {
  [key: string]: Generator &
    Cryptor &
    Signer &
    PostActionable<FilePayload, void>;
} = {
  KMS: new KmsGenerator(),
  NATIVE: new NativeGenerator(),
};
