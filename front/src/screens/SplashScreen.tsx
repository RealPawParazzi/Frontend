import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
    navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
    useEffect(() => {
        const checkLoginStatus = async () => {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2초간 로딩 효과

            const token = await AsyncStorage.getItem('userToken'); // 저장된 로그인 정보 확인
            if (token) {
                navigation.replace('Home'); // 로그인 되어있으면 홈으로 이동
            } else {
                navigation.replace('Auth'); // 로그인 안되어 있으면 로그인/회원가입 화면으로 이동
            }
        };

        checkLoginStatus();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>🐾 PawParazzi</Text>
            <ActivityIndicator size="large" color="orange" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFB74D' },
    logo: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 20 },
});

export default SplashScreen;
