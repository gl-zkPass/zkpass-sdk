/*
 * signing.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { ZkPassApiKey, ZkPassClient } from "@didpass/zkpass-client-ts";
import {
  API_KEY,
  API_SECRET,
  ZKPASS_SERVICE_URL,
  ZKPASS_ZKVM,
} from "@/utils/constants";

interface SigningKey {
  privateKey: string; //in PEM format
  jwks: {
    jku: string;
    kid: string;
  };
}

async function signDataToJwsToken(
  data: { [key: string]: any },
  signingKey: SigningKey
) {
  const API_KEY_OBJ = new ZkPassApiKey(API_KEY ?? "", API_SECRET ?? "");

  const verifyingKeyJKWS = {
    jku: signingKey.jwks.jku,
    kid: signingKey.jwks.kid,
  };

  /**
   * Step 1: Instantiate the zkPassClient object
   */
  const zkPassClient = new ZkPassClient({
    zkPassServiceUrl: ZKPASS_SERVICE_URL ?? "",
    zkPassApiKey: API_KEY_OBJ,
    zkVm: ZKPASS_ZKVM ?? "",
  });

  /**
   * Step 2: Call the zkPassClient.signDataToJwsToken.
   *         This is to digitally-sign the user data.
   */
  const dataToken = await zkPassClient.signDataToJwsToken(
    signingKey.privateKey,
    data,
    verifyingKeyJKWS
  );

  return dataToken;
}

export { signDataToJwsToken };
