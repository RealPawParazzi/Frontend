import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/Auths/SplashScreen';
import LoginScreen from '../screens/Auths/LoginScreen';
import KakaoLoginWebView from '../screens/Auths/KakaoLoginWebView';
import SignupScreen from '../screens/Auths/SignupScreen';
import TutorialScreen from '../screens/Auths/TutorialScreen';
import BottomTabNavigator from './BottomTabNavigator'; // 홈 화면
import StorybookScreen from '../screens/Storybooks/StorybookScreen';
import StorybookDetailScreen from '../screens/Storybooks/StorybookDetailScreen';
import EditStorybookScreen from '../screens/Storybooks/EditStorybookScreen'; // ✨ 수정 페이지 추가
import VideoEditorScreen from '../screens/Storybooks/VideoEditorScreen';
import ImageEditorScreen from '../screens/Storybooks/ImageEditorScreen';
import PetRegistrationScreen from '../screens/Pets/PetRegistrationScreen';
import PetEditScreen from '../screens/Pets/PetEditScreen';
import FollowListScreen from '../screens/MiniProfile/FollowListScreen'; // 🆕 팔로워/팔로잉 목록 화면 추가
import UserPostsScreen from '../screens/MiniProfile/UserPostsScreen'; // 🆕 특정 유저 게시글 목록 추가
import { loadUserData }  from '../context/userStore';
import authStore from '../context/authStore'; // ✅ authStore 추가
import { ActivityIndicator, View } from 'react-native';

export type RootStackParamList = {
    Splash: undefined;
    Tutorial: undefined;
    Login : undefined;
    KakaoLoginWebView: undefined;
    Signup : undefined;
    Home: undefined;
    StorybookScreen: undefined;
    StorybookDetailScreen: { boardId: number }; // ✅ 상세 페이지에서 boardId를 받음
    EditStorybookScreen: { boardId: number }; // 🆕 게시글 수정 페이지 추가
    VideoEditorScreen: undefined;
    ImageEditorScreen: undefined;
    PetRegistrationScreen: undefined;
    PetEditScreen: { pet: object };
    FollowListScreen: { type: 'followers' | 'following' }; // 🆕 팔로워/팔로잉 목록 네비게이션 추가
    UserPostsScreen: { userId: number; userName: string }; // 🆕 특정 유저 게시글 목록 추가
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {

    const [isLoading, setIsLoading] = useState(true);
    const { isLoggedIn, checkAuthStatus } = authStore(); // ✅ 로그인 상태 확인

    useEffect(() => {
        const initializeApp = async () => {
            console.log('🟢 앱 시작 - 로그인 상태 확인');
            const isAuthenticated = await checkAuthStatus(); // ✅ 로그인 확인

            if (isAuthenticated) {
                console.log('🟢 로그인 상태 유지됨, 유저 데이터 불러옴');
                await loadUserData(); // ✅ 로그인 상태일 때만 유저 데이터 로드
            }

            setIsLoading(false);
        };

        initializeApp();
    }, [checkAuthStatus]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        );
    }


    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
                <Stack.Screen name="Home" component={BottomTabNavigator} />
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Splash" component={SplashScreen} />
                    <Stack.Screen name="Tutorial" component={TutorialScreen} />
                    <Stack.Screen name="KakaoLoginWebView" component={KakaoLoginWebView} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                </>
            )}
            <Stack.Screen name="StorybookScreen" component={StorybookScreen} />
            <Stack.Screen name="StorybookDetailScreen" component={StorybookDetailScreen} />
            <Stack.Screen name="VideoEditorScreen" component={VideoEditorScreen} />
            <Stack.Screen name="ImageEditorScreen" component={ImageEditorScreen} />
            <Stack.Screen name="EditStorybookScreen" component={EditStorybookScreen} />
            <Stack.Screen name="PetRegistrationScreen" component={PetRegistrationScreen} />
            <Stack.Screen name="PetEditScreen" component={PetEditScreen} />
            <Stack.Screen name="FollowListScreen" component={FollowListScreen} />
            <Stack.Screen name="UserPostsScreen" component={UserPostsScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
