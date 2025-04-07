// ✅ kakaoStore.ts - Access + Refresh 토큰 구조에 맞게 전체 리팩토링 (Zustand)
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateToken } from '../services/authService';

// ✅ 카카오 상태 타입 정의
interface KakaoState {
    token: string | null;
    isKakaoLogin: boolean;
    setToken: (accessToken: string, refreshToken: string) => Promise<void>;
    clearToken: () => Promise<void>;
    checkTokenValidity: () => Promise<boolean>;
}

// ✅ Zustand 기반 스토어 생성
export const useKakaoStore = create<KakaoState>((set) => ({
    token: null,
    isKakaoLogin: false,

    /**
     * ✅ accessToken + refreshToken 저장
     * - AsyncStorage에 각각 저장
     * - 내부 상태도 함께 갱신
     */
    setToken: async (accessToken, refreshToken) => {
        await AsyncStorage.multiSet([
            ['accessToken', accessToken],
            ['refreshToken', refreshToken],
        ]);
        set({ token: accessToken, isKakaoLogin: true });
    },

    /**
     * ✅ 모든 토큰 삭제 (로그아웃)
     * - access + refresh 둘 다 제거
     * - 내부 로그인 상태 false 처리
     */
    clearToken: async () => {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        set({ token: null, isKakaoLogin: false });
    },


    /**
     * ✅ 저장된 accessToken 기준 유효성 확인
     * - 유효하면 로그인 상태 유지
     * - 만료 or 없음 → false 반환 및 상태 초기화
     */
    checkTokenValidity: async () => {
        const token = await AsyncStorage.getItem('accessToken');
        const isValid = token && await validateToken();

        if (isValid) {
            set({ token, isKakaoLogin: true });
            return true;
        } else {
            set({ token: null, isKakaoLogin: false });
            return false;
        }
    },
}));
