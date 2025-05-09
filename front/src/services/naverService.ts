import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/auth'
    : 'http://localhost:8080/api/auth';

export const requestNaverToken = async (code: string) => {
    const response = await fetch(`${API_BASE_URL}/naver/callback?code=${code}`);
    if (!response.ok) { throw new Error('네이버 로그인 실패'); }
    return await response.json(); // { accessToken, refreshToken }
};

