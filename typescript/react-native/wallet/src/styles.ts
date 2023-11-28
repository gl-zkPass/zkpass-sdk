/*
 * styles.ts
 * Stylesheet of HomePage.tsx
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

import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10, 
    width: '100%',
    backgroundColor: '#FFFFFF',
    marginBottom: 125
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginVertical: 30,
    textAlign: 'center'
  },
  dvrInformation: {
    justifyContent: 'center',
    height: 550,
    width: '100%',
    backgroundColor: '#F9F9F9',
    borderColor: '#E3E3E3',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 20,
  },
  dvrInformationHeader: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 15,
    marginHorizontal: 5
  },
  dvrInformationHeaderText: {
    color: 'black',
    fontWeight: 'bold'
  },
  dvrInformationHeaderCopy: {
    flexDirection: 'row',
  },
  dvrInformationHeaderCopyText: {
    color: 'blue',
    fontWeight: 'bold'
  },
  dvrContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderColor: '#E3E3E3',
    borderWidth: 1
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'column',
    width: '100%',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: '#00AEEF',
    marginBottom: 5,
  },
  buttonDisabled: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: 'gray',
    marginBottom: 5,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Roboto_500Medium',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
});
