import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

interface Props {
    navigation: AuthScreenNavigationProp;
}

const AuthScreen: React.FC<Props> = ({ navigation }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = async () => {
        if (email && password) {
            await AsyncStorage.setItem('userToken', 'dummy-token'); // 가짜 토큰 저장
            navigation.replace('Home'); // 로그인 성공 시 홈으로 이동
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isSignup ? '회원가입' : '로그인'}</Text>
            <TextInput placeholder="이메일" style={styles.input} value={email} onChangeText={setEmail} />
            <TextInput placeholder="비밀번호" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

            <TouchableOpacity style={styles.button} onPress={handleAuth}>
                <Text style={styles.buttonText}>{isSignup ? '가입하기' : '로그인'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
                <Text style={styles.switchText}>{isSignup ? '로그인으로 이동' : '회원가입'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF3E0' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '80%', padding: 10, borderWidth: 1, borderRadius: 10, marginBottom: 10 },
    button: { backgroundColor: 'orange', padding: 12, borderRadius: 10, marginTop: 10 },
    buttonText: { color: 'white', fontSize: 16 },
    switchText: { marginTop: 10, color: 'blue' },
});

export default AuthScreen;
