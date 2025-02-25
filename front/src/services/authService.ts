import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1/auth'; // 🟢 백엔드 API 주소

export interface RegisterRequest {
    email: string;
    password: string;
    nickName: string;
    profileImageUrl?: string; // 선택적 필드
    name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface APIResponse {
    token?: string;
    message?: string;
}

// ✅ 회원가입 API 호출
export const registerUser = async (data: RegisterRequest): Promise<void> => {
    try {
        console.log('📤 요청 URL:', `${API_BASE_URL}/signup`);
        console.log('📤 요청 데이터:', data);

        await axios.post(`${API_BASE_URL}/signup`, data);
    } catch (error: any) {
        throw error.response?.data || { message: '회원가입 실패' };
    }
};

// ✅ 로그인 API 호출
export const loginUser = async (data: LoginRequest): Promise<string> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, data);
        return response.data.token; // JWT 토큰 반환
    } catch (error: any) {
        throw error.response?.data || { message: '로그인 실패' };
    }
};

// ✅ 토큰 검증 API 호출
export const validateToken = async (token: string): Promise<boolean> => {
    try {
        await axios.get(`${API_BASE_URL}/validate`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return true;
    } catch {
        return false;
    }
};

// ✅ 현재 로그인된 사용자 정보 가져오기
export const fetchCurrentUser = async (token: string): Promise<any> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: '사용자 정보를 불러오지 못했습니다.' };
    }
};
