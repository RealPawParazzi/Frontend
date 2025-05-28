import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import {NavigationContainer} from '@react-navigation/native';
import Snackbar from './common/Snackbar';

// App.tsx 최상단
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

// 필요 시 에러 핸들러도 추가
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log('❌ 무시된 에러:', error.message);
});

const App = () => {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <AppNavigator /> {/* ✅ 여기서만 NavigationContainer를 감싸야 함 */}
              <Snackbar />
            </NavigationContainer>
        </SafeAreaProvider>
    );
};

export default App;
