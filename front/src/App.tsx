import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomTabNavigator from './navigation/BottomTabNavigator';

const App = () => {
    return (
        <SafeAreaProvider>
            <BottomTabNavigator />
        </SafeAreaProvider>
    );
};

export default App;
