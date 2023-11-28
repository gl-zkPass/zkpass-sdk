/*
 * HomePage.tsx
 * Main Page of The Wallet Demo Mobile App
 * 
 * Authors:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: November 7th 2023
 * -----
 * Last Modified: November 28th 2023
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   JaniceLaksana (janice.laksana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Clipboard, Alert } from 'react-native';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  generateZkPassProof 
} from '@didpass/zkpass-client-react-native';
import Config from 'react-native-config';
import { JwtPayload, decode } from 'jsonwebtoken';
import { DownloadDirectoryPath, exists, readFile, unlink, writeFile } from 'react-native-fs';
import JsonDisplayer from './json-displayer/JsonDisplayer';
import { StatusCodes } from 'http-status-codes';

enum PAGE_STATE {
  DVR,
  UserData,
  GenerateProof,
  ShowTokenProof
}

const HomePage = () => {
  const [pageState, setPageState] = useState<PAGE_STATE>(PAGE_STATE.DVR);
  const [userData, setUserData] = useState<string>('');
  const [dvr, setDvr] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [proofToken, setProofToken] = useState<string>('');
  
  useEffect(() => {
    if (!Config.USER_DATA_TOKEN || !Config.DVR_TOKEN) {
      setIsError(true);
      return;
    }
    const userData = decode(Config.USER_DATA_TOKEN!) as JwtPayload;
    const decodedUserData = userData?.data;
    setUserData(decodedUserData);

    const Dvr = decode(Config.DVR_TOKEN!) as JwtPayload;
    const decodedDvr = Dvr?.data;
    const decodedDvrQuery = JSON.parse(decodedDvr.query);
    setDvr(decodedDvrQuery);
  }, []);

  const handleCopyPress = () => {
    if(pageState == PAGE_STATE.DVR) {
      Clipboard.setString(JSON.stringify(dvr, null, 2));
    } else if(pageState == PAGE_STATE.UserData) {
      Clipboard.setString(JSON.stringify(userData, null, 2));
    }
  };
  
  const goNext = () => {
    if(pageState == PAGE_STATE.DVR) {
      setPageState(PAGE_STATE.UserData);
    } else if(pageState == PAGE_STATE.UserData) {
      setPageState(PAGE_STATE.GenerateProof);
    } else if(pageState == PAGE_STATE.GenerateProof) {
      setPageState(PAGE_STATE.ShowTokenProof);
    }
  };

  const goBack = () => {
    if(pageState == PAGE_STATE.UserData) {
      setPageState(PAGE_STATE.DVR);
    } else if(pageState == PAGE_STATE.GenerateProof) {
      setPageState(PAGE_STATE.UserData);
    } else if(pageState == PAGE_STATE.ShowTokenProof) {
      setPageState(PAGE_STATE.GenerateProof);
    }
  };

  const goToStart = () => {
    setPageState(PAGE_STATE.DVR);
    setProofToken('');
    setIsError(false);
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
          .then((token) => {
            Alert.alert('Success Download', token.substring(0, 100) + '...');
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
      if (!Config.USER_DATA_TOKEN || !Config.DVR_TOKEN || !Config.ZKPASS_URL) {
        setIsError(true);
        return;
      }

      /**
       * Step 1
       * Provide ZKPass Url, User Data Token, and Dvr Token
       */
      const userDataToken = Config.USER_DATA_TOKEN;
      const dvrToken = Config.DVR_TOKEN;
      const zkPassUrl = Config.ZKPASS_URL;

      /**
       * Step 2
       * Generate ZkPass Proof by ZkPass Url
       */
      const result: any = await generateZkPassProof(
        zkPassUrl!, 
        userDataToken!,
        dvrToken!
      );

      if (result.status == StatusCodes.OK && result.proof) {
        setPageState(PAGE_STATE.ShowTokenProof);
        setProofToken(result.proof);
        setIsError(false);     
      }
      else throw 'error';
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
      if(pageState == PAGE_STATE.GenerateProof) {
        await generateProof();
      }
    })();
  }, [pageState]);

  if (isError) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View style={styles.container}>
          <Text style={{color: 'red'}}>Oops! Something wrong happened!</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={retryGenerateProof}
            >
              <Text style={styles.buttonText}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View style={styles.container}>
        <Text style={styles.header}>
          {pageState == PAGE_STATE.DVR && 'Please review your Data Verification Request'}
          {pageState == PAGE_STATE.UserData && 'Please review your User Data'}
          {pageState == PAGE_STATE.GenerateProof && 'Generating Proof'}
          {pageState == PAGE_STATE.ShowTokenProof && 'Generated Token Proof'}
        </Text>

        {/* Display JSON Data & Token */}
        {(pageState == PAGE_STATE.DVR || 
          pageState == PAGE_STATE.UserData || 
          pageState == PAGE_STATE.ShowTokenProof) &&
          <View style={styles.dvrInformation}>
            <View style={styles.dvrInformationHeader}>
              <Text style={styles.dvrInformationHeaderText}>
                {pageState == PAGE_STATE.DVR && 'Data Verification Request'}
                {pageState == PAGE_STATE.UserData && 'User Data'}
                {pageState == PAGE_STATE.ShowTokenProof && 'Token Proof'}
              </Text>

              {pageState == PAGE_STATE.ShowTokenProof &&  
                <TouchableOpacity
                  style={styles.dvrInformationHeaderCopy}
                  onPress={downloadProofAsFile}
                  testID={'copy-button'}
                >
                  <Text style={styles.dvrInformationHeaderCopyText}>
                    Download
                  </Text>
                </TouchableOpacity>
              }

              <TouchableOpacity
                style={styles.dvrInformationHeaderCopy}
                onPress={handleCopyPress}
                testID={'copy-button'}
              >
                <Text style={styles.dvrInformationHeaderCopyText}>
                  Copy
                </Text>
              </TouchableOpacity>
            </View>
            
            <JsonDisplayer
              jsonText={
                pageState == PAGE_STATE.DVR 
                  ? JSON.stringify(dvr, null, 2)
                  : pageState == PAGE_STATE.UserData 
                    ? JSON.stringify(userData, null, 2)
                    : proofToken.substring(0,1000) + '...'
              }
              containerStyle={styles.dvrContainer}
            />
          </View>
        }
      </View>

      {/* Display Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {pageState == PAGE_STATE.UserData && 
          <TouchableOpacity
            style={styles.button}
            onPress={goBack}
          >
            <Text style={styles.buttonText}>
              Back
            </Text>
          </TouchableOpacity>
        }

        {(pageState == PAGE_STATE.DVR || pageState == PAGE_STATE.UserData) && 
          <TouchableOpacity
            style={styles.button}
            onPress={goNext}
          >
            <Text style={styles.buttonText}>
              Continue
            </Text>
          </TouchableOpacity>
        }

        {pageState == PAGE_STATE.ShowTokenProof && 
          <TouchableOpacity
            style={styles.button}
            onPress={goToStart}
          >
            <Text style={styles.buttonText}>
              Go to Start
            </Text>
          </TouchableOpacity>
        }
      </View>
    </SafeAreaView>
  );
};

export default HomePage;
