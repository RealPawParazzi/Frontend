// kakaoStore.ts - 카카오 로그인 상태 관리 전용 스토어 (Zustand 사용)
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateToken } from '../services/authService';

// "카카오스테이트" 인터페이스 정의
interface KakaoState {
    token: string | null;           // JWT 토큰
    isKakaoLogin: boolean;          // 카카오 로그인 여부

    setToken: (token: string) => void;    // 토큰 저장 함수
    clearToken: () => void;               // 토큰 삭제 함수
    checkTokenValidity: () => Promise<boolean>; // 토큰 유효성 확인 함수
}

// "카카오스토어" 생성
export const useKakaoStore = create<KakaoState>((set) => ({
    token: null,
    isKakaoLogin: false,

    // ✅ JWT 토큰 저장 및 카카오 로그인 상태 true로 변경
    setToken: async (token: string) => {
        await AsyncStorage.setItem('userToken', token);
        set({ token, isKakaoLogin: true }); // 카카오 로그인 성공 상태 업데이트
    },

    // ✅ JWT 토큰 삭제 및 카카오 로그인 상태 false로 변경
    clearToken: async () => {
        await AsyncStorage.removeItem('userToken');
        set({ token: null, isKakaoLogin: false }); // 로그아웃 상태 업데이트
    },

    // ✅ 저장된 토큰의 유효성 확인 후 상태 갱신
    checkTokenValidity: async () => {
        const token = await AsyncStorage.getItem('userToken');
        if (token && await validateToken()) {
            set({ token, isKakaoLogin: true });
            return true;
        } else {
            set({ token: null, isKakaoLogin: false });
            return false;
        }
    },
}));
