// userService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 🔹 백엔드 API 기본 URL
const API_BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/auth'  // 안드로이드용
    : 'http://localhost:8080/api/auth'; // iOS용

export interface UserData {
    id: string;
    name: string;
    email: string;
    nickName: string;
    profileImage: string;
    petList: { id: string; name: string; imageUrl: string }[];
    recentPosts: { id: string; title: string; content: string; imageUrl: string }[];
}

/**
 * ✅ 전체 회원 목록 조회 API
 * @returns 가입된 모든 사용자 목록 반환
 */
export const fetchAllUsers = async (): Promise<UserData[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}`);
        if (!response.ok) { throw new Error('전체 유저 목록을 불러오지 못했습니다.'); }

        const users: { id: number; name: string; nickName: string; profileImage: string }[] = await response.json();

        // ✅ 구조분해 할당을 사용하여 `profileImage` 유지
        return users.map(({ id, name, nickName, profileImage }) => ({
            id: String(id), // ✅ number → string 변환
            name,
            nickName,
            profileImage, // ✅ 유지
            email: '', // 기본값 추가 (선택적 필드)
            petList: [], // 빈 배열로 기본값 설정
            recentPosts: [], // 빈 배열로 기본값 설정
        }));
    } catch (error) {
        console.error('❌ 전체 유저 목록 불러오기 실패:', error);
        throw error;
    }
};

/**
 * ✅ 현재 로그인된 사용자 정보 가져오기
 * @returns 사용자 정보 객체 반환
 * @throws 토큰이 없거나 유효하지 않을 경우 오류 발생
 */
export const fetchUserData = async (): Promise<UserData> => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) throw new Error('토큰이 없습니다.');

        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            console.error('❌ 사용자 정보를 불러오지 못했습니다.', response.status);
            throw new Error('사용자 정보를 불러오지 못했습니다.');
        }

        const userData = await response.json();
        console.log('✅ 불러온 사용자 데이터:', userData); // ✅ 유저 데이터 확인

        return userData;
    } catch (error) {
        console.error('❌ 사용자 데이터 로드 실패:', error);
        throw error;
    }
};

/**
 * ✅ 사용자 정보 수정 API (multipart/form-data)
 * @param updateData 변경할 사용자 정보 객체 (닉네임, 이름)
 * @param profileImage 프로필 이미지 파일 (선택 사항)
 * @returns 수정된 사용자 정보
 */
export const updateUser = async (
    updateData: {
        nickName?: string;
        name?: string;
    },
    profileImage?: { uri: string; name: string; type: string } // 🔵 변경된 타입
) => {
    try {
        console.log('📤 사용자 정보 수정 요청:', updateData);

        const token = await AsyncStorage.getItem('userToken');
        if (!token) throw new Error('토큰이 없습니다.');

        const formData = new FormData();

        // ✅ JSON 데이터를 문자열로 변환하여 form-data에 추가
        formData.append('userData', JSON.stringify(updateData));

        // ✅ 프로필 이미지가 있다면 추가
        if (profileImage) {
            formData.append('profileImage', {
                uri: profileImage.uri,
                name: profileImage.name || 'profile.jpg',
                type: profileImage.type || 'image/jpeg',
            } as any);
        }

        const response = await fetch(`${API_BASE_URL}/me`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData, // ✅ multipart/form-data 요청
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '사용자 정보 수정 실패');
        }

        return await response.json();
    } catch (error: any) {
        throw new Error(error.message);
    }
};
