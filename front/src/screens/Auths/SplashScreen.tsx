import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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
            const token = await AsyncStorage.getItem('userToken');
            setTimeout(() => {
                if (token) {
                    navigation.replace('Home'); // ✅ 로그인 되어 있으면 홈으로 이동
                } else {
                    navigation.replace('Auth'); // ✅ 로그인 안 되어 있으면 로그인 화면으로 이동
                }
            }, 1500); // 스플래시 화면 1.5초 유지
        };

        checkLoginStatus();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#FF5733" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF3E0' },
});

export default SplashScreen;
