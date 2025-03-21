// authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserData } from './userService';
import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/auth'  // 안드로이드용
    : 'http://localhost:8080/api/auth'; // iOS용

/**
 * ✅ 회원가입 API (multipart/form-data)
 * @param data 회원가입 요청 데이터 (이메일, 비밀번호, 닉네임, 이름)
 * @param profileImage 프로필 이미지 파일 (선택 사항)
 * @throws 회원가입 실패 시 오류 발생
 */
export const registerUser = async (
    data: {
        email: string;
        password: string;
        nickName: string;
        name: string;
    },
    profileImage?: { uri: string; name: string; type: string } // 🔵 변경된 타입
) => {
    try {
        console.log('📤 회원가입 요청:', data);

        const formData = new FormData();
        formData.append('userData', JSON.stringify(data)); // ✅ JSON 데이터를 문자열로 변환하여 추가

        // ✅ 프로필 이미지가 있다면 추가
        if (profileImage) {
            formData.append('profileImage', {
                uri: profileImage.uri,
                name: profileImage.name,
                type: profileImage.type,
            } as any);
        }

        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}`, // 🔵 토큰 추가
            },
            body: formData, // ✅ multipart/form-data 요청
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '회원가입 실패');
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

/**
 * ✅ 회원 탈퇴 API
 * @returns 회원 탈퇴 성공 메시지 반환
 * @throws 실패 시 오류 발생
 */
export const deleteUser = async () => {
    try {
        console.log('📤 회원 탈퇴 요청');

        const token = await AsyncStorage.getItem('userToken');
        if (!token) { throw new Error('토큰이 없습니다.'); }

        const response = await fetch(`${API_BASE_URL}/delete`, {
            method: 'DELETE', // 탈퇴 요청은 DELETE
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '회원 탈퇴 실패');
        }

        await AsyncStorage.removeItem('userToken'); // ✅ 탈퇴 성공 시 토큰 삭제
        return '회원 탈퇴 완료';
    } catch (error: any) {
        throw new Error(error.message);
    }
};

/**
 * ✅ 로그인 API
 * @param data 로그인 요청 데이터 (이메일, 비밀번호)
 * @returns JWT 토큰 (로그인 성공 시)
 * @throws 로그인 실패 시 오류 발생
 */
export const loginUser = async (data: { email: string; password: string }) => {
    try {
        console.log('📤 로그인 요청:', data);

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '로그인 실패');
        }

        const { token } = await response.json();
        await AsyncStorage.setItem('userToken', token); // ✅ 로그인 성공 시 토큰 저장
        return token;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

/**
 * ✅ 로그아웃 API
 * - 로컬 스토리지에서 토큰 삭제
 */
export const logoutUser = async () => {
    console.log('📤 로그아웃 요청');
    await AsyncStorage.removeItem('userToken'); // 🔵 토큰 삭제
};

/**
 * ✅ 토큰 검증 API
 * @returns 토큰이 유효한지 여부 (true/false)
 */
export const validateToken = async (): Promise<boolean> => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {return false;}

        // 🔹 백엔드에 `/auth/validate` 없으므로 대신 유저 데이터를 가져와 확인
        const userData = await fetchUserData();


        // 🔹 유저 데이터가 존재하고, 아이디가 0이 아닐 경우 유효한 로그인 상태로 판단
        return !!(userData?.id && userData.id !== '0');
    } catch {
        return false;
    }
};



