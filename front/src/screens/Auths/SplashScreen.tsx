import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import LottieView from 'lottie-react-native';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
    navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
    useEffect(() => {
        const checkAppStatus = async () => {
            const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
            const token = await AsyncStorage.getItem('userToken');

            setTimeout(() => {
                if (isFirstLaunch === null) {
                    // ✅ 처음 설치한 경우 튜토리얼 화면으로 이동
                    AsyncStorage.setItem('isFirstLaunch', 'false');
                    navigation.replace("Tutorial");
                } else if (token) {
                    // ✅ 로그인 상태라면 홈으로 이동
                    navigation.replace('Home');
                } else {
                    // ✅ 로그인 안 되어 있으면 로그인 화면으로 이동
                    navigation.replace('Auth');
                }
            }, 2000); // 2초간 로딩 애니메이션 유지
        };

        checkAppStatus();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <LottieView
                source={require('../../assets/animations/paws.json')} // 🔥 Lottie JSON 파일 필요
                autoPlay
                loop
                style={styles.lottie}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#FFF3E0" },
    lottie: { width: 150, height: 150 },
});

export default SplashScreen;
