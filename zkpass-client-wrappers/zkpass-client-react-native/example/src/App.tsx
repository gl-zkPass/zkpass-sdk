/*
 * App.tsx
 * Example demo for zkpass-client-react-native
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: November 28th 2023
 * -----
 * Last Modified: November 30th 2023
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   ntejapermana (nugraha.tejapermana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { encryptDataToJWEToken } from '@didpass/zkpass-client-react-native';
import { decryptJWEToken } from '@didpass/zkpass-client-react-native';
import { signDataToJWSToken } from '@didpass/zkpass-client-react-native';
import { verifyJWSToken } from '@didpass/zkpass-client-react-native';
import { generateZkPassProof } from '@didpass/zkpass-client-react-native';

export default function App() {
  const publicKey =
    '-----BEGIN PUBLIC KEY-----\n' +
    'YOUR_P256_PUBLIC_KEY\n' +
    '-----END PUBLIC KEY-----';
  const privateKey =
    '-----BEGIN PRIVATE KEY-----\n' +
    'YOUR_P256_PRIVATE_KEY\n' +
    '-----END PRIVATE KEY-----';
  const data = JSON.stringify({
    Hello: 'World!',
  });

  encryptDataToJWEToken(publicKey, data).then(console.log);

  const jwe = 'YOUR_JWE';
  decryptJWEToken(privateKey, jwe).then(console.log);

  const verificationKeys = {
    jku: 'YOUR_JKU',
    kid: 'YOUR_KID',
  };

  signDataToJWSToken(privateKey, data, verificationKeys).then(console.log);

  const jws = 'YOUR_JWS';
  verifyJWSToken(publicKey, jws).then(console.log);

  const url = 'http://your.zkpass.service.url.com/';
  const userData = 'USER_DATA_JWE';
  const dvrToken = 'DVR_TOKEN_JWE';

  generateZkPassProof(url, userData, dvrToken).then(console.log);

  return (
    <View style={styles.container}>
      <Text>Result</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
