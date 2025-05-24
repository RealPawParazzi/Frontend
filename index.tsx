/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import appJson from './app.json';
const appName = appJson.name;

// TypeScript 적용
AppRegistry.registerComponent(appName, () => App);
