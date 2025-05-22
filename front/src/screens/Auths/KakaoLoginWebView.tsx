import React, { useRef } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    SafeAreaView,
    Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { useKakaoStore } from '../../context/kakaoStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import authStore from '../../context/authStore';
import {requestKakaoToken} from '../../services/kakaoService';
import { loadUserData } from '../../context/userStore';
import { API_ROOT_URL } from '../../config/apiConfig';

// ✅ 네비게이션 타입 정의
type NavigationProp = StackNavigationProp<RootStackParamList, 'KakaoLoginWebView'>;

const KakaoLoginWebView: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { setToken } = useKakaoStore();
    const webViewRef = useRef(null); // ✅ access + refresh 저장 함수

    /**
     * ✅ 카카오 인가 코드 처리 후 백엔드로 요청 → access/refresh 토큰 발급 받기
     */
    const handleKakaoLogin = async (code: string) => {
        try {
            const { accessToken, refreshToken } = await requestKakaoToken(code);
            await setToken(accessToken, refreshToken);

            // ⭐ 유저 데이터 명시적으로 다시 불러오기
            await loadUserData();
            authStore.setState({ isLoggedIn: true });
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        } catch (err) {
            console.error('카카오 로그인 처리 실패:', err);
        }
    };

    const handleShouldStartLoadWithRequest = (request: any) => {
        let { url } = request;
        // if (Platform.OS === 'android' && url.includes('localhost')) {
        //     url = url.replace('localhost', '10.0.2.2');
        // }

        const codeMatch = url.match(/[?&]code=([^&]+)/);
        if (url.includes('/kakao/callback') && codeMatch) {
            const code = decodeURIComponent(codeMatch[1]);
            handleKakaoLogin(code);
            navigation.goBack();
            return false;
        }

        return true;
    };

    return (
        <SafeAreaView style={styles.container}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{
                  uri: `${API_ROOT_URL}/auth/login/kakao`,
                }}
                onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                onError={({ nativeEvent }) => console.warn('WebView 에러:', nativeEvent)}
                onHttpError={({ nativeEvent }) => console.warn('HTTP 에러 발생:', nativeEvent)}
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

export default KakaoLoginWebView;
