// 📄 kakaoService.ts - 카카오 로그인 서비스 로직 구현
import { Linking, Platform } from 'react-native';

// 🔹 백엔드 API 기본 URL
const API_BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/auth'  // 안드로이드용
    : 'http://localhost:8080/api/auth'; // iOS용

export const kakaoLogin = async () => {
    // ✅ 백엔드 카카오 로그인 API로 이동 (웹뷰 방식 추천)
    Linking.openURL(`${API_BASE_URL}/login/kakao`);
};
