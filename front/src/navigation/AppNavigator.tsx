import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import BottomTabNavigator from './BottomTabNavigator'; // 홈 화면
import StorybookScreen from '../screens/StorybookScreen';
import VideoEditorScreen from '../screens/VideoEditorScreen';
import ImageEditorScreen from '../screens/ImageEditorScreen';

export type RootStackParamList = {
    Splash: undefined;
    Auth: undefined;
    Home: undefined;
    StorybookScreen: undefined;
    VideoEditorScreen: undefined;
    ImageEditorScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Home" component={BottomTabNavigator} />
            <Stack.Screen name="StorybookScreen" component={StorybookScreen} />
            <Stack.Screen name="VideoEditorScreen" component={VideoEditorScreen} />
            <Stack.Screen name="ImageEditorScreen" component={ImageEditorScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
