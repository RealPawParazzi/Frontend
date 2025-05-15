import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateToken } from '../services/authService';

interface NaverState {
    token: string | null;
    isNaverLogin: boolean;
    setToken: (accessToken: string, refreshToken: string) => Promise<void>;
    clearToken: () => Promise<void>;
    checkTokenValidity: () => Promise<boolean>;
}

export const useNaverStore = create<NaverState>((set) => ({
    token: null,
    isNaverLogin: false,

    setToken: async (accessToken, refreshToken) => {
        await AsyncStorage.multiSet([
            ['accessToken', accessToken],
            ['refreshToken', refreshToken],
        ]);
        set({ token: accessToken, isNaverLogin: true });
    },

    clearToken: async () => {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        set({ token: null, isNaverLogin: false });
    },

    checkTokenValidity: async () => {
        const token = await AsyncStorage.getItem('accessToken');
        const isValid = token && await validateToken();

        if (isValid) {
            set({ token, isNaverLogin: true });
            return true;
        } else {
            set({ token: null, isNaverLogin: false });
            return false;
        }
    },
}));
