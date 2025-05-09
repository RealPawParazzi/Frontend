import React, { useRef } from 'react';
import { ActivityIndicator, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useNaverStore } from '../../context/naverStore';
import authStore from '../../context/authStore';
import { requestNaverToken } from '../../services/naverService';

type NavigationProp = StackNavigationProp<RootStackParamList, 'NaverLoginWebView'>;

const NaverLoginWebView: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const webViewRef = useRef(null);
    const { setToken } = useNaverStore();

    const handleNaverLogin = async (code: string) => {
        try {
            const { accessToken, refreshToken } = await requestNaverToken(code);
            await setToken(accessToken, refreshToken);
            authStore.setState({ isLoggedIn: true });
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        } catch (err) {
            console.error('네이버 로그인 처리 실패:', err);
        }
    };

    const handleShouldStartLoadWithRequest = (request: any) => {
        let { url } = request;
        if (Platform.OS === 'android' && url.includes('localhost')) {
            url = url.replace('localhost', '10.0.2.2');
        }

        const codeMatch = url.match(/[?&]code=([^&]+)/);
        if (url.includes('/naver/callback') && codeMatch) {
            const code = decodeURIComponent(codeMatch[1]);
            handleNaverLogin(code);
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
                    uri: Platform.OS === 'android'
                        ? 'http://10.0.2.2:8080/api/auth/login/naver'
                        : 'http://localhost:8080/api/auth/login/naver',
                }}
                onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                onError={({ nativeEvent }) => console.warn('WebView 에러:', nativeEvent)}
                onHttpError={({ nativeEvent }) => console.warn('HTTP 에러:', nativeEvent)}
                startInLoadingState
                renderLoading={() => (
                    <ActivityIndicator size="large" color="#6A4BBC" style={styles.loader} />
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

