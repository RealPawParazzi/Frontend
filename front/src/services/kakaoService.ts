// 📄 kakaoService.ts - 카카오 로그인 서비스 로직 구현
import axios from 'axios';
import { Linking } from 'react-native';

const BASE_URL = 'http://localhost:8080/api/auth';

export const kakaoLogin = async () => {
    // ✅ 백엔드 카카오 로그인 API로 이동 (웹뷰 방식 추천)
    Linking.openURL(`${BASE_URL}/login/kakao`);
};
