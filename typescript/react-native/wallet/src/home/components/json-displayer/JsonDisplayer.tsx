import {
  ScrollView, 
  Text, 
  View,
  ViewStyle,
  StyleProp
} from 'react-native';
import React from 'react';
import {styles} from './style';

interface props {
  jsonText: string;
  containerStyle: StyleProp<ViewStyle>
}

const JsonDisplayer = ({jsonText, containerStyle}: props) => {

  return (
    <ScrollView showsHorizontalScrollIndicator={false} style={containerStyle}>
      <View>
        <Text style={styles.code}>{jsonText}</Text>
      </View>
    </ScrollView>
  );
};

export default JsonDisplayer;
