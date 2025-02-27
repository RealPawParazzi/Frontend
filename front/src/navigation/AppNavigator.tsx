import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import BottomTabNavigator from './BottomTabNavigator'; // 홈 화면
import StorybookScreen from '../screens/StorybookScreen';
import VideoEditorScreen from '../screens/VideoEditorScreen';
import ImageEditorScreen from '../screens/ImageEditorScreen';
import { loadUserData }  from '../context/userStore';
import { ActivityIndicator, View } from 'react-native';

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

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeApp = async () => {
            console.log('🟢 앱 시작 - loadUserData 실행!');
            await loadUserData(); // ✅ 유저 데이터 먼저 불러오기
            setIsLoading(false);
        };

        initializeApp();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        ); // ✅ 데이터 로딩 중에는 로딩 UI 표시
    }


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
