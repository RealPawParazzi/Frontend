import React, { useRef } from 'react';
import { ActivityIndicator, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useNaverStore } from '../../context/naverStore';
import authStore from '../../context/authStore';
import { requestNaverToken } from '../../services/naverService';
import { loadUserData } from '../../context/userStore';
import { API_ROOT_URL } from '../../config/apiConfig';

type NavigationProp = StackNavigationProp<RootStackParamList, 'NaverLoginWebView'>;

const NaverLoginWebView: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const webViewRef = useRef(null);
    const { setToken } = useNaverStore();

    const handleNaverLogin = async (code: string, state: string) => {
        try {
            const { accessToken, refreshToken } = await requestNaverToken(code, state);
            await setToken(accessToken, refreshToken);

            // ⭐ 유저 데이터 명시적으로 다시 불러오기
            await loadUserData();
            authStore.setState({ isLoggedIn: true });
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        } catch (err) {
            console.error('네이버 로그인 처리 실패:', err);
        }
    };

    const handleShouldStartLoadWithRequest = (request: any) => {
        let { url } = request;
        // if (Platform.OS === 'android' && url.includes('localhost')) {
        //     url = url.replace('localhost', '10.0.2.2');
        // }

        const codeMatch = url.match(/[?&]code=([^&]+)/);
        const stateMatch = url.match(/[?&]state=([^&]+)/);

        if (url.includes('/naver/callback') && codeMatch && stateMatch) {
            const code = decodeURIComponent(codeMatch[1]);
            const state = decodeURIComponent(stateMatch[1]);
            handleNaverLogin(code, state);  // ✅ state까지 넘겨야 함
            navigation.goBack();
            return false;
        }

        return true;
    };

    const STATE = 'secureRandomState'; // 백엔드와 반드시 일치시켜야 함

    return (
        <SafeAreaView style={styles.container}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{
                  uri: `${API_ROOT_URL}/auth/login/naver?state=${STATE}`,
                }}
                onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                onError={({ nativeEvent }) => console.warn('WebView 에러:', nativeEvent)}
                onHttpError={({ nativeEvent }) => console.warn('HTTP 에러:', nativeEvent)}
                startInLoadingState
                renderLoading={() => (
                    <ActivityIndicator size="large" color="#4D7CFE" style={styles.loader} />
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    loader: { flex: 1, justifyContent: 'center' },
});

export default NaverLoginWebView;

