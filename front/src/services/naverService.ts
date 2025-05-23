import { API_ROOT_URL } from '../config/apiConfig';

// 🔹 백엔드 API 기본 URL
const API_BASE_URL = `${API_ROOT_URL}/auth`;

/**
 * ✅ 네이버 로그인 API
 * @param code 네이버 인증 코드
 * @param state CSRF 방지를 위한 상태 값
 * @returns {Promise<{ accessToken: string; refreshToken: string }>} 네이버 로그인 성공 시 토큰 정보
 * @throws {Error} 네이버 로그인 실패 시 오류 발생
 */
export const requestNaverToken = async (code: string, state: string) => {
    const response = await fetch(`${API_BASE_URL}/naver/callback?code=${code}&state=${state}`);
    if (!response.ok) { throw new Error('네이버 로그인 실패'); }
    return await response.json(); // { accessToken, refreshToken }
};

