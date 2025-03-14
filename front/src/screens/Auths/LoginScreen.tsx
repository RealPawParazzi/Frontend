import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, validateToken } from '../../services/authService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { kakaoLogin } from '../../services/kakaoService';

// ✅ 네비게이션 타입 지정
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    // ✅ 이메일 상태 관리
    const [email, setEmail] = useState('');
    // ✅ 비밀번호 상태 관리
    const [password, setPassword] = useState('');
    // ✅ 로딩 상태 관리 (로그인 요청 중 여부)
    const [loading, setLoading] = useState(false);
    // ✅ 비밀번호 숨김 토글 관리
    const [showPassword, setShowPassword] = useState(false);

    // ✅ 화면 로딩 시 자동 로그인 여부 검사
    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (token && await validateToken()) {
                // 자동 로그인 성공 시 홈 화면으로 바로 이동
                navigation.replace('Home');
            }
        };
        checkAuth();
    }, [navigation]);

    // ✅ 로그인 버튼 눌렀을 때 실행되는 함수
    const handleLogin = async () => {
        // 입력 유효성 검사 (이메일, 비밀번호 모두 입력됐는지)
        if (!email || !password) {
            Alert.alert('경고', '이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        setLoading(true); // 로그인 처리 시작 (로딩 표시 ON)

        try {
            // ✅ 로그인 API 호출 후 토큰 받아오기
            const token = await loginUser({ email, password });
            // ✅ 받은 토큰 AsyncStorage에 저장 (자동로그인 용도)
            await AsyncStorage.setItem('userToken', token);
            // ✅ 홈 화면으로 이동
            navigation.replace('Home');
        } catch (error: any) {
            // 로그인 실패 시 에러 메시지 표시
            Alert.alert('로그인 실패', error.message || '로그인 중 문제가 발생했습니다.');
        } finally {
            setLoading(false); // 로그인 처리 완료 (로딩 표시 OFF)
        }
    };

    // ✅ 카카오 로그인 실행 로직 추가
    const handleKakaoLogin = async () => {
        await kakaoLogin();
    };

    return (
        <View style={styles.container}>
            {/* 앱 로고 */}
            <Text style={styles.logo}>PawParazzi</Text>
            <Text style={styles.welcome}>Hi! Welcome back, you've been missed</Text>

            {/* 이메일 입력 필드 */}
            <TextInput
                placeholder="Enter your email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            {/* 비밀번호 입력 필드 */}
            <View style={styles.passwordContainer}>
                <TextInput
                    placeholder="Enter your Password"
                    style={styles.passwordInput}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={22} color="#999" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forget Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                {loading ? (
                    // 로딩 중이면 로딩 인디케이터 표시
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.loginButtonText}>Log in</Text>
                )}
            </TouchableOpacity>

            <Text style={styles.continueText}>Or continue with</Text>

            <View style={styles.socialContainer}>
                {/* 카카오 로그인 버튼 추가 및 클릭 연동 완료 */}
                <TouchableOpacity onPress={() => navigation.navigate('KakaoLoginWebView')}>
                    <Image source={require('../../assets/images/kakao-talk_64.png')} style={styles.socialIcon} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupLink}>Signup</Text></Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
    logo: { fontSize: 32, color: '#6A4BBC', fontWeight: 'bold', marginBottom: 30 },
    welcome: { fontSize: 16, color: '#888', marginBottom: 50 },

    input: { width: '100%', padding: 15, backgroundColor: '#F3F3F3', borderRadius: 10, marginBottom: 15 },

    passwordContainer: {
        width: '100%', padding: 15, backgroundColor: '#F3F3F3', borderRadius: 10,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5,
    },
    passwordInput: { flex: 1 },

    forgotPassword: { alignSelf: 'flex-end', color: '#6A4BBC', marginTop: 10 ,marginBottom: 40 },

    loginButton: { width: '100%', backgroundColor: '#6A4BBC', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
    loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    continueText: { color: '#888', marginTop: 10 ,marginBottom: 15 },

    socialContainer: { flexDirection: 'row', gap: 20, marginBottom: 20 },
    socialIcon: { width: 40, height: 40 },

    signupText: { color: '#888' , marginTop: 2},
    signupLink: { color: '#6A4BBC', fontWeight: 'bold' },
});

export default LoginScreen;
