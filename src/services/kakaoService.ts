// 📄 kakaoService.ts - 카카오 로그인 서비스 로직 구현
import { API_ROOT_URL } from '../config/apiConfig';

// 🔹 백엔드 API 기본 URL
const API_BASE_URL = `${API_ROOT_URL}/auth`;


/**
 * ✅ 카카오 로그인 API
 * @param code 카카오 인증 코드
 * @returns {Promise<{ accessToken: string; refreshToken: string }>} 카카오 로그인 성공 시 토큰 정보
 * @throws {Error} 카카오 로그인 실패 시 오류 발생
 */
export const requestKakaoToken = async (code: string) => {
    const response = await fetch(`${API_BASE_URL}/kakao/callback?code=${code}`);
    if (!response.ok) { throw new Error('카카오 로그인 실패'); }
    return await response.json(); // { accessToken, refreshToken }
};

