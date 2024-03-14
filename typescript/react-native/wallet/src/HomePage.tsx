/*
 * HomePage.tsx
 * Main Page of The Wallet Demo Mobile App
 *
 * Authors:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: November 7th 2023
 * -----
 * Last Modified: March 13th 2024
 * Modified By: handrianalandi (handrian.alandi@gdplabs.id)
 * -----
 * Reviewers:
 *   JaniceLaksana (janice.laksana@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ZkPassApiKey,
  ZkPassClient,
} from '@didpass/zkpass-client-react-native';
import { JwtPayload, decode } from 'jsonwebtoken';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  DownloadDirectoryPath,
  exists,
  readFile,
  unlink,
  writeFile,
} from 'react-native-fs';
import JsonDisplayer from './json-displayer/JsonDisplayer';
import { 
  DVR_TOKEN, 
  USER_DATA_TOKEN, 
  ZKPASS_API_KEY, 
  ZKPASS_API_SECRET, 
  ZKPASS_URL 
} from './constants';

enum PageState {
  DVR,
  UserData,
  GenerateProof,
  ShowTokenProof,
}

const HomePage = () => {
  const [pageState, setPageState] = useState<PageState>(PageState.DVR);
  const [userData, setUserData] = useState<string>('');
  const [dvr, setDvr] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [proofToken, setProofToken] = useState<string>('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const userDataPayload = decode(USER_DATA_TOKEN) as JwtPayload;
        setUserData(userDataPayload?.data);

        const dvrPayload = decode(DVR_TOKEN) as JwtPayload;
        setDvr(JSON.parse(dvrPayload?.data.query));
      } catch (error) {
        setIsError(true);
      }
    };

    loadInitialData();
  }, []);

  const handleCopyPress = () => {
    const dataToCopy = pageState === PageState.DVR ? dvr : userData;
    Clipboard.setString(JSON.stringify(dataToCopy, null, 2));
  };

  const goNext = () => {
    if (pageState == PageState.DVR) {
      setPageState(PageState.UserData);
    } else if (pageState == PageState.UserData) {
      setPageState(PageState.GenerateProof);
    } else if (pageState == PageState.GenerateProof) {
      setPageState(PageState.ShowTokenProof);
    }
  };

  const goBack = () => {
    if (pageState == PageState.UserData) {
      setPageState(PageState.DVR);
    } else if (pageState == PageState.GenerateProof) {
      setPageState(PageState.UserData);
    } else if (pageState == PageState.ShowTokenProof) {
      setPageState(PageState.GenerateProof);
    }
  };

  const goToStart = () => {
    setPageState(PageState.DVR);
    setProofToken('');
    setIsError(false);
  };

  const truncateToken = (token: string) => {
    const TOKEN_LIMIT = 1000;
    return token.substring(0, TOKEN_LIMIT) + '...';
  };

  const downloadProofAsFile = async () => {
    const path = DownloadDirectoryPath + '/proof_token.json';
    const fileExists = await exists(path);
    if (fileExists) {
      await unlink(path);
    }

    writeFile(path, proofToken)
      .then(() => {
        readFile(path)
          .then(() => {
            Alert.alert(
              'File Downloaded',
              'The proof_token.json is stored in Downloads folder'
            );
          })
          .catch((err) => {
            Alert.alert('Error Reading Saved JSON', err.message);
          });
      })
      .catch((err) => {
        Alert.alert('Error Downloading Saved JSON', err.message);
      });
  };

  const generateProof = async () => {
    try {
      /**
       * Step 1
       * Provide zkPass Url, User Data Token, Dvr Token, zkPassApiKey, and zkPassClient
       */
      const userDataToken = USER_DATA_TOKEN;
      const dvrToken = DVR_TOKEN;
      const zkPassUrl = ZKPASS_URL;

      const zkPassApiKey = new ZkPassApiKey(
        ZKPASS_API_KEY,
        ZKPASS_API_SECRET
      );

      const zkPassClient = new ZkPassClient({
        zkPassServiceUrl: zkPassUrl, 
        zkPassApiKey});

      /**
       * Step 2
       * Generate ZkPass Proof by ZkPass Url
       */
      const result: any = await zkPassClient.generateZkPassProof(
        userDataToken!,
        dvrToken!
      );

      setPageState(PageState.ShowTokenProof);
      setProofToken(result);
      setIsError(false);
    } catch (error) {
      setProofToken('');
      setIsError(true);
    }
  };

  const retryGenerateProof = async () => {
    await generateProof();
  };

  useEffect(() => {
    (async () => {
      if (pageState == PageState.GenerateProof) {
        await generateProof();
      }
    })();
  }, [pageState]);

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={{ color: 'red' }}>Oops! Something wrong happened!</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={retryGenerateProof}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>
          {pageState == PageState.DVR &&
            'Please review your Data Verification Request'}
          {pageState == PageState.UserData && 'Please review your User Data'}
          {pageState == PageState.GenerateProof && 'Generating Proof'}
          {pageState == PageState.ShowTokenProof && 'Generated Token Proof'}
        </Text>

        {/* Display JSON Data & Token */}
        {(pageState == PageState.DVR ||
          pageState == PageState.UserData ||
          pageState == PageState.ShowTokenProof) && (
          <View style={styles.dvrInformation}>
            <View style={styles.dvrInformationHeader}>
              <Text style={styles.dvrInformationHeaderText}>
                {pageState == PageState.DVR && 'Data Verification Request'}
                {pageState == PageState.UserData && 'User Data'}
                {pageState == PageState.ShowTokenProof && 'Token Proof'}
              </Text>

              {pageState == PageState.ShowTokenProof && (
                <TouchableOpacity
                  style={styles.dvrInformationHeaderCopy}
                  onPress={downloadProofAsFile}
                  testID={'copy-button'}
                >
                  <Text style={styles.dvrInformationHeaderCopyText}>
                    Download
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.dvrInformationHeaderCopy}
                onPress={handleCopyPress}
                testID={'copy-button'}
              >
                <Text style={styles.dvrInformationHeaderCopyText}>Copy</Text>
              </TouchableOpacity>
            </View>

            <JsonDisplayer
              jsonText={
                pageState == PageState.DVR
                  ? JSON.stringify(dvr, null, 2)
                  : pageState == PageState.UserData
                    ? JSON.stringify(userData, null, 2)
                    : truncateToken(proofToken)
              }
              containerStyle={styles.dvrContainer}
            />
          </View>
        )}
      </View>

      {/* Display Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {pageState == PageState.UserData && (
          <TouchableOpacity style={styles.button} onPress={goBack}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        )}

        {(pageState == PageState.DVR || pageState == PageState.UserData) && (
          <TouchableOpacity style={styles.button} onPress={goNext}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        )}

        {pageState == PageState.ShowTokenProof && (
          <TouchableOpacity style={styles.button} onPress={goToStart}>
            <Text style={styles.buttonText}>Go to Start</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomePage;
