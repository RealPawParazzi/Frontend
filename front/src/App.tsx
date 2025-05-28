import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import {NavigationContainer} from '@react-navigation/native';
import Snackbar from './common/Snackbar';

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
