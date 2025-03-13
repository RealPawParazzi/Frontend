import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { loginUser, registerUser, validateToken } from '../../services/authService';
import { launchImageLibrary } from 'react-native-image-picker'; // 🔵 이미지 선택 라이브러리
import Icon from 'react-native-vector-icons/MaterialIcons'; // ✅ 아이콘 추가


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
    const [profileImage, setProfileImage] = useState<{ uri: string; name: string; type: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // ✅ 기본 프로필 이미지 설정
    const getProfileImage = () => {
        return profileImage ? { uri: profileImage.uri } : require('../../assets/images/profile-1.png');
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
                await registerUser(
                    { email, password, nickName, name },
                    profileImage ?? undefined // 🔵 선택한 이미지 포함
                );
                Alert.alert('회원가입 성공!', '이제 로그인하세요.');
                setIsSignup(false);
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

    // ✅ 프로필 이미지 선택 핸들러 (파일 선택)
    const handleImagePick = async () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 1,
                maxWidth: 800,
                maxHeight: 800,
            },
            (response) => {
                if (response.didCancel) {
                    console.log('❌ 이미지 선택 취소');
                } else if (response.errorMessage) {
                    console.error('❌ 이미지 선택 오류:', response.errorMessage);
                    Alert.alert('이미지 선택 오류', response.errorMessage);
                } else if (response.assets && response.assets.length > 0) {
                    const asset = response.assets[0];
                    setProfileImage({
                        uri: asset.uri!,
                        name: asset.fileName || 'profile.jpg',
                        type: asset.type || 'image/jpeg',
                    });
                }
            }
        );
    };

    return (
        <View style={styles.container}>
            {/* 🟢 로그인 & 회원가입 모드에 따라 화면 다르게 표시 */}
            {isSignup ? (
                // 회원가입 시 프로필 이미지 미리보기
                <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
                    <Image source={getProfileImage()} style={styles.profileImage} />
                    <View style={styles.iconContainer}>
                        <Icon name="add-circle" size={28} color="orange" />
                    </View>
                </TouchableOpacity>
            ) : (
                // 로그인 시 강아지 발바닥 아이콘 표시
                <View style={styles.pawIconContainer}>
                    <Icon name="pets" size={80} color="orange" />
                </View>
            )}

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

    // ✅ 프로필 이미지 컨테이너
    imageContainer: { position: 'relative', marginBottom: 20 },
    profileImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ddd' }, // 원형 이미지

    // ✅ 로그인 - 강아지 발바닥 아이콘 컨테이너
    pawIconContainer: { marginBottom: 50 },

    // ✅ + 아이콘
    iconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 2,
    },

    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '80%', padding: 10, borderWidth: 1, borderRadius: 10, marginBottom: 10, backgroundColor: 'white' },
    button: { backgroundColor: 'orange', padding: 12, borderRadius: 10, marginTop: 10, width: '80%', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16 },
    switchText: { marginTop: 10, color: 'blue' },
});

export default AuthScreen;
