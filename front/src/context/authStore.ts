// ✅ 새로운 authStore.ts 생성
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadUserData } from './userStore';
import { loginUser, logoutUser, validateToken } from '../services/authService';

/** ✅ Auth 상태 타입 정의 */
interface AuthState {
    isLoggedIn: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
}

/** ✅ Zustand 전역 상태 */
const authStore = create<AuthState>((set) => ({
    isLoggedIn: false, // 초기값: 로그인 X

    /** ✅ 로그인 실행 (API 호출 + 상태 업데이트) */
    login: async (email, password) => {
        try {
            console.log('🟢 로그인 시도:', email);
            const token = await loginUser({ email, password });

            console.log('🔄 유저 데이터 불러오기');
            await loadUserData(); // ✅ 로그인 후 유저 정보 갱신

            set({ isLoggedIn: true });
            console.log('🟢 로그인 완료');
            return true; // 성공 시 true 반환
        } catch (error) {
            console.error('❌ 로그인 실패:', error);
            return false; // 실패 시 false 반환
        }
    },

    /** ✅ 로그아웃 실행 */
    logout: async () => {
        console.log('🔴 로그아웃 진행 중...');
        await logoutUser(); // ✅ 로그아웃 API 호출 (토큰 삭제)
        set({ isLoggedIn: false });
        console.log('🔴 로그아웃 완료');
    },

    /** ✅ 앱 실행 시 로그인 상태 확인 */
    checkAuthStatus: async () => {
        try {
            console.log('🔄 로그인 상태 확인 중...');
            const isValid = await validateToken(); // ✅ 토큰 검증 API 호출

            if (isValid) {
                console.log('🟢 유효한 로그인 상태');
                await loadUserData(); // ✅ 로그인 유지 시 유저 정보 갱신
                set({ isLoggedIn: true });
            } else {
                console.log('🔴 로그인 만료');
                set({ isLoggedIn: false });
                await AsyncStorage.removeItem('userToken'); // 만료된 토큰 삭제
            }
        } catch (error) {
            console.error('❌ 로그인 상태 확인 실패:', error);
            set({ isLoggedIn: false });
        }
    },
}));

export default authStore;
