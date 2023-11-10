/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

global.TextEncoder = require('text-encoding').TextEncoder;
AppRegistry.registerComponent(appName, () => App);
