import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import BottomTabNavigator from './BottomTabNavigator'; // 홈 화면
import StorybookScreen from '../screens/StorybookScreen';
import StorybookDetailScreen from '../screens/StorybookDetailScreen';
import EditStorybookScreen from '../screens/EditStorybookScreen'; // ✨ 수정 페이지 추가
import VideoEditorScreen from '../screens/VideoEditorScreen';
import ImageEditorScreen from '../screens/ImageEditorScreen';
import PetRegistrationScreen from '../screens/PetRegistrationScreen';
import PetInfoScreen from '../screens/PetInfoScreen';
import PetEditScreen from '../screens/PetEditScreen';
import FollowListScreen from '../screens/FollowListScreen'; // 🆕 팔로워/팔로잉 목록 화면 추가
import { loadUserData }  from '../context/userStore';
import { ActivityIndicator, View } from 'react-native';

export type RootStackParamList = {
    Splash: undefined;
    Auth: undefined;
    Home: undefined;
    StorybookScreen: undefined;
    StorybookDetailScreen: { boardId: number }; // ✅ 상세 페이지에서 boardId를 받음
    EditStorybookScreen: { boardId: number }; // 🆕 게시글 수정 페이지 추가
    VideoEditorScreen: undefined;
    ImageEditorScreen: undefined;
    PetRegistrationScreen: undefined;
    PetInfoScreen: undefined;
    PetEditScreen: { pet: object };
    FollowListScreen: { type: 'followers' | 'following' }; // 🆕 팔로워/팔로잉 목록 네비게이션 추가
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
        );
    }


    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Home" component={BottomTabNavigator} />
            <Stack.Screen name="StorybookScreen" component={StorybookScreen} />
            <Stack.Screen name="StorybookDetailScreen" component={StorybookDetailScreen} />
            <Stack.Screen name="VideoEditorScreen" component={VideoEditorScreen} />
            <Stack.Screen name="ImageEditorScreen" component={ImageEditorScreen} />
            <Stack.Screen name="EditStorybookScreen" component={EditStorybookScreen} />
            <Stack.Screen name="PetRegistrationScreen" component={PetRegistrationScreen} />
            <Stack.Screen name="PetInfoScreen" component={PetInfoScreen} />
            <Stack.Screen name="PetEditScreen" component={PetEditScreen} />
            <Stack.Screen name="FollowListScreen" component={FollowListScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
