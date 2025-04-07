// 📄 kakaoService.ts - 카카오 로그인 서비스 로직 구현
import { Linking, Platform } from 'react-native';

// 🔹 백엔드 API 기본 URL
const API_BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/auth'  // 안드로이드용
    : 'http://localhost:8080/api/auth'; // iOS용

export const requestKakaoToken = async (code: string) => {
    const response = await fetch(`${API_BASE_URL}/kakao/callback?code=${code}`);
    if (!response.ok) throw new Error('카카오 로그인 실패');
    return await response.json(); // { accessToken, refreshToken }
};