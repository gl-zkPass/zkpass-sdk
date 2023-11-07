import React, { FC, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Clipboard, Alert } from 'react-native';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  generateZkPassProof 
} from '@didpass/zkpass-client-react-native';
import Config from 'react-native-config';
import { decode } from 'jsonwebtoken';
import { DownloadDirectoryPath, exists, readFile, unlink, writeFile } from 'react-native-fs';
import JsonDisplayer from './components/json-displayer/JsonDisplayer';


const HomePage = () => {
  const [proofState, setProofState] = useState<
    'DVR' | 
    'UserData' | 
    'GenerateProof' | 
    'ShowTokenProof'
  >('DVR');
  const [userData, setUserData] = useState<string>('');
  const [dvr, setDvr] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [proofToken, setProofToken] = useState<string>('');
  
  const userDataToken = 'eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20venVsYW1kYXQvenVsYW1kYXQuZ2l0aHViLmlvL3NhbXBsZS1rZXkvemtwLWtleS9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEiLCJhbGciOiJFUzI1NiJ9.eyJkYXRhIjp7ImJjYURvY0lEIjoiRE9DODk3OTIzQ1AiLCJiY2FEb2NOYW1lIjoiQkNBIEN1c3RvbWVyIFByb2ZpbGUiLCJjdXN0b21lcklEIjoiQkNBMTIzNzU2MTA4IiwicGVyc29uYWxJbmZvIjp7ImZpcnN0TmFtZSI6IkRld2kiLCJsYXN0TmFtZSI6IlB1dHJpIiwiZGF0ZU9mQmlydGgiOiIxOTgwLTAxLTAxIiwiZHJpdmVyTGljZW5zZU51bWJlciI6IkRMMTIzNDU2Nzg5In0sImZpbmFuY2lhbEluZm8iOnsiYXZlcmFnZU1vbnRobHlCYWxhbmNlIjoyMDAwMDAwMDAsImNyZWRpdFJhdGluZ3MiOnsicGVmaW5kbyI6NzIwLCJjcmVkaXRLYXJtYSI6NzI1LCJlcXVpSW5mbyI6NzMwfSwiYWNjb3VudHMiOnsiY2hlY2tpbmciOnsiYWNjb3VudE51bWJlciI6IkNISzEyMzQ1NjciLCJiYWxhbmNlIjo1MDAwMDAwMH0sInNhdmluZ3MiOnsiYWNjb3VudE51bWJlciI6IlNBVjEyMzQ1NjciLCJiYWxhbmNlIjoxNTAwMDAwMDB9fX0sImxvYW5IaXN0b3J5IjpbeyJsb2FuVHlwZSI6ImF1dG8iLCJsb2FuQW1vdW50IjoyMDAwMDAwMDAsImxvYW5TdGF0dXMiOiJjbG9zZWQifV0sImNvbnRhY3RJbmZvIjp7ImVtYWlsIjoiZGV3aS5wdXRyaUB5YWhvby5jb20iLCJwaG9uZSI6Iis2Mi04NTUtMTIzLTQ1NjcifSwiZmxhZ3MiOnsiaXNPdmVyZHJhZnRQcm90ZWN0ZWQiOnRydWUsImlzVklQIjpmYWxzZSwiZnJhdWRBbGVydHMiOmZhbHNlfX19.Z8zKFQJJHIs4oaqRQ9V_R75waswfEqcjpHwfiQdUKU4aju6Spf9pMhUgajfI2rSjAQXtmGjteDx_yC6o74tSDg';
  const dvrToken = 'eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20venVsYW1kYXQvenVsYW1kYXQuZ2l0aHViLmlvL3NhbXBsZS1rZXkvemtwLWtleS92ZXJpZmllci1rZXkuanNvbiIsImtpZCI6ImstMSIsImFsZyI6IkVTMjU2In0.eyJkYXRhIjp7ImR2cl90aXRsZSI6Ik15IERWUiIsImR2cl9pZCI6IjEyMzQ1Njc4IiwicXVlcnlfZW5naW5lX3ZlciI6IjAuMS4wIiwicXVlcnlfbWV0aG9kX3ZlciI6ImE3ODhjNjg2YmY3N2I5Y2VhZmNmODFiNWYzOTYyNWZiZmE5ZjdhN2EyNjU4YThiOGExMzRiNjgzOWNkOTJjZjUiLCJxdWVyeSI6IntcImFuZFwiOlt7XCI9PVwiOltcImJjYURvY0lEXCIsXCJET0M4OTc5MjNDUFwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmZpcnN0TmFtZVwiLFwiRGV3aVwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmxhc3ROYW1lXCIsXCJQdXRyaVwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmRyaXZlckxpY2Vuc2VOdW1iZXJcIixcIkRMMTIzNDU2Nzg5XCJdfSx7XCI-PVwiOltcImZpbmFuY2lhbEluZm8uY3JlZGl0UmF0aW5ncy5wZWZpbmRvXCIsNjUwXX0se1wiPj1cIjpbXCJmaW5hbmNpYWxJbmZvLmFjY291bnRzLnNhdmluZ3MuYmFsYW5jZVwiLDMwMDAwMDAwXX1dfSIsInVzZXJfZGF0YV91cmwiOiJodHRwczovL3h5ei5jb20iLCJ1c2VyX2RhdGFfdmVyaWZ5aW5nX2tleSI6eyJLZXlzZXRFbmRwb2ludCI6eyJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20venVsYW1kYXQvenVsYW1kYXQuZ2l0aHViLmlvL3NhbXBsZS1rZXkvemtwLWtleS9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEifX19fQ.x6uTHXCjgA15hrXh7GShDOdH3K6was-zSYZeojjqMQckp0_NIIdeHdHOgcfqvkvmonpYJIxACDcCnynOsy3NBg';
  
  useEffect(() => {
    const decodedUserData = decode(userDataToken).data;
    setUserData(decodedUserData);

    const decodedDvr = decode(dvrToken).data;
    const decodedDvrQuery = JSON.parse(decodedDvr.query);
    setDvr(decodedDvrQuery);
  }, []);

  const handleCopyPress = () => {
    if(proofState == 'DVR') {
      Clipboard.setString(JSON.stringify(dvr, null, 2));
    } else if(proofState == 'UserData') {
      Clipboard.setString(JSON.stringify(userData, null, 2));
    }
  };
  
  const goNext = () => {
    if(proofState == 'DVR') {
      setProofState('UserData');
    } else if(proofState == 'UserData') {
      setProofState('GenerateProof');
    } else if(proofState == 'GenerateProof') {
      setProofState('ShowTokenProof');
    }
  };

  const goBack = () => {
    if(proofState == 'UserData') {
      setProofState('DVR');
    } else if(proofState == 'GenerateProof') {
      setProofState('UserData');
    } else if(proofState == 'ShowTokenProof') {
      setProofState('GenerateProof');
    }
  };

  const goToStart = () => {
    setProofState('DVR');
    setProofToken('');
    setIsError(false);
  }

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
      const result:any = await generateZkPassProof(Config.ZKPASS_URL || '', userDataToken, dvrToken);

      if (result.status == 200 && result.proof) {
        console.log('Proof Token: ', result.proof)
        setProofState('ShowTokenProof');
        setProofToken(result.proof);
        setIsError(false);     
      }
      else throw 'error';
    } catch (error) {
      console.error('Error generate proof:', error);
      setProofToken('');
      setIsError(true);
    }
  }

  const retryGenerateProof = async () => {
    await generateProof();
  }

  useEffect(() => {
    (async () => {
      if(proofState == 'GenerateProof') {
        await generateProof();
      }
    })();
  }, [proofState]);

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
          {proofState == 'DVR' && 'Please review your Data Verification Request'}
          {proofState == 'UserData' && 'Please review your User Data'}
          {proofState == 'GenerateProof' && 'Generating Proof'}
          {proofState == 'ShowTokenProof' && 'Generated Token Proof'}
        </Text>

        {/* Display JSON Data & Token */}
        {(proofState == 'DVR' || 
          proofState == 'UserData' || 
          proofState == 'ShowTokenProof') &&
          <View style={styles.dvrInformation}>
            <View style={styles.dvrInformationHeader}>
              <Text style={styles.dvrInformationHeaderText}>
                {proofState == 'DVR' && 'Data Verification Request'}
                {proofState == 'UserData' && 'User Data'}
                {proofState == 'ShowTokenProof' && 'Token Proof'}
              </Text>

              {proofState == 'ShowTokenProof' &&  
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
                proofState == 'DVR' 
                  ? JSON.stringify(dvr, null, 2)
                  : proofState == 'UserData' 
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
        {proofState == 'UserData' && 
          <TouchableOpacity
            style={styles.button}
            onPress={goBack}
          >
            <Text style={styles.buttonText}>
              Back
            </Text>
          </TouchableOpacity>
        }

        {(proofState == 'DVR' || proofState == 'UserData') && 
          <TouchableOpacity
            style={styles.button}
            onPress={goNext}
          >
            <Text style={styles.buttonText}>
              Continue
            </Text>
          </TouchableOpacity>
        }

        {proofState == 'ShowTokenProof' && 
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
