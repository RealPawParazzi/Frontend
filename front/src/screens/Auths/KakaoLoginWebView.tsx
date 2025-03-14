import React from 'react';
import { View, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useKakaoStore } from '../../context/kakaoStore';

type KakaoLoginNavigationProp = StackNavigationProp<RootStackParamList, 'KakaoLoginWebView'>;

interface Props {
    navigation: KakaoLoginNavigationProp;
}

const KakaoLoginWebView: React.FC<Props> = ({ navigation }) => {
    const { setToken } = useKakaoStore();

    // URL 요청 전에 매번 호출되는 함수 (즉각적인 URL 감지)
    const handleShouldStartLoadWithRequest = (request: any) => {
        const { url } = request;

        // 백엔드가 제공한 성공 URL 감지
        if (url.includes('/auth/success')) {
            const tokenMatch = url.match(/[?&]token=([^&]+)/);

            if (tokenMatch) {
                const jwtToken = decodeURIComponent(tokenMatch[1]);

                setToken(jwtToken); // 토큰 저장 처리
                navigation.replace('Home'); // 로그인 성공 후 홈으로 이동

                return false; // 이 URL을 로딩하지 않음 (WebView 종료)
            }
        }

        return true; // 그 외 URL은 계속 로딩 허용
    };

    return (
        <SafeAreaView style={styles.container}>
            <WebView
                source={{ uri: 'http://localhost:8080/api/auth/login/kakao' }}
                onNavigationStateChange={handleShouldStartLoadWithRequest}
                startInLoadingState
                renderLoading={() => (
                    <ActivityIndicator size="large" color="#6A4BBC" style={styles.loader} />
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#FFF'}, // backgroundColor로 자연스럽게 여백 처리
    loader: {flex: 1, justifyContent: 'center'},
});


export default KakaoLoginWebView;
