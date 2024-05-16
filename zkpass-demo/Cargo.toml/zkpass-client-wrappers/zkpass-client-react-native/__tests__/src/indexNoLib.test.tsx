/*
 * indexNoLib.test.tsx
 * Unit test of zkpass-client-react-native (not happy path)
 *
 * Authors:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: November 29th 2023
 * -----
 * Last Modified: March 13th 2024
 * Modified By: GDPWinerPranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 *   JaniceLaksana (janice.laksana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { Platform } from 'react-native';
import { ZkPassClient } from '../../src/index';
import { publicKeyVerifier } from '../__mocks__/keys';
import { mockCustomData } from '../__mocks__/userDataVariables';

describe('zkpass-client-react-native no NativeModules', () => {
  let zkPassClient: ZkPassClient;

  beforeAll(() => {
    const zkPassServiceUrl =
      process.env.ZKPASS_WS_URL ?? 'https://staging-zkpass.ssi.id';

    zkPassClient = new ZkPassClient({ zkPassServiceUrl });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfuly handle no ZkPassJwtUtility', async () => {
    try {
      await zkPassClient.encryptDataToJweToken(
        publicKeyVerifier,
        mockCustomData
      );
    } catch (error) {
      expect(error).toEqual(
        new Error(
          `The package '@didpass/zkpass-client-react-native' doesn't seem to be linked. Make sure: \n\n` +
            Platform.select({
              ios: "- You have run 'pod install'\n",
              default: '',
            }) +
            '- You rebuilt the app after installing the package\n' +
            '- You are not using Expo Go\n'
        )
      );
    }
  });
});
