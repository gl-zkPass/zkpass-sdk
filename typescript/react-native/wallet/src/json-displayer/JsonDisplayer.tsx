/*
 * JsonDisplayer.tsx
 * COMPONENT TO DISPLAY JSON FORMATTED OBJECT
 * 
 * Authors:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: November 7th 2023
 * -----
 * Last Modified: November 28th 2023
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 GDP LABS. All rights reserved.
 */

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
