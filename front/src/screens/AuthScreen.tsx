import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { loginUser, registerUser, validateToken } from '../services/authService';

// ✅ 네비게이션 타입 지정
type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

interface Props {
    navigation: AuthScreenNavigationProp;
}

const AuthScreen: React.FC<Props> = ({ navigation }) => {
    const [isSignup, setIsSignup] = useState(false); // 회원가입 or 로그인 모드
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickName, setNickName] = useState('');
    const [name, setName] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null); // 프로필 이미지 상태 추가
    const [loading, setLoading] = useState(false); // 로딩 상태

    // ✅ 기본 프로필 이미지 설정 함수
    const getProfileImage = () => {
        return profileImageUrl && profileImageUrl.trim() !== ''
            ? { uri: profileImageUrl }
            : require('../assets/images/profile-1.png'); //  기본 프로필 이미지 설정
    };

    // ✅ 앱 실행 시 자동 로그인 검사
    useEffect(() => {
        const checkAuthStatus = async () => {
            setLoading(true); // 자동 로그인 중 표시
            const token = await AsyncStorage.getItem('userToken');
            if (token && await validateToken()) {
                navigation.replace('Home'); // 🔵 유효한 토큰이면 홈 화면으로 이동
            }
            setLoading(false);
        };
        checkAuthStatus();
    }, [navigation]);

    // ✅ 로그인 & 회원가입 처리
    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
            return;
        }

        setLoading(true);

        try {
            if (isSignup) {
                // 🟠 회원가입 요청
                await registerUser({
                    email,
                    password,
                    nickName,
                    name,
                    profileImageUrl: profileImageUrl || '', // 기본 프로필 이미지 사용 시 빈 문자열 전달
                });
                Alert.alert('회원가입 성공!', '이제 로그인하세요.');
                setIsSignup(false); // 로그인 화면으로 전환
            } else {
                // 🔵 로그인 요청
                const token = await loginUser({ email, password });
                await AsyncStorage.setItem('userToken', token);
                navigation.replace('Home'); // 홈 화면으로 이동
            }
        } catch (error: any) {
            Alert.alert('오류', error.message || '문제가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* 🟢 프로필 이미지 표시 */}
            <Image source={getProfileImage()} style={styles.logo} />

            <Text style={styles.title}>{isSignup ? '회원가입' : '로그인'}</Text>

            <TextInput
                placeholder="이메일"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                placeholder="비밀번호"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {isSignup && (
                <>
                    <TextInput placeholder="닉네임" style={styles.input} value={nickName} onChangeText={setNickName} />
                    <TextInput placeholder="이름" style={styles.input} value={name} onChangeText={setName} />
                    <TextInput
                        placeholder="프로필 이미지 URL (선택)"
                        style={styles.input}
                        value={profileImageUrl || ''}
                        onChangeText={setProfileImageUrl}
                    />
                </>
            )}

            <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{isSignup ? '가입하기' : '로그인'}</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
                <Text style={styles.switchText}>{isSignup ? '로그인으로 이동' : '회원가입'}</Text>
            </TouchableOpacity>
        </View>
    );
};

// ✅ 스타일 정의
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF3E0' },
    logo: { width: 150, height: 150, marginBottom: 20, borderRadius: 75 }, // $$$$$$$$$ 동그란 프로필 이미지
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '80%', padding: 10, borderWidth: 1, borderRadius: 10, marginBottom: 10, backgroundColor: 'white' },
    button: { backgroundColor: 'orange', padding: 12, borderRadius: 10, marginTop: 10, width: '80%', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16 },
    switchText: { marginTop: 10, color: 'blue' },
});

export default AuthScreen;
