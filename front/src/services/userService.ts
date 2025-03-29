// userService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { reissueAccessToken } from './authService';


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
 * ✅ 인증 헤더 자동 생성 함수 (Access Token 만료 시 자동 재발급)
 * - accessToken 가져오기
 * - /me 테스트 요청 → 401이면 refresh로 갱신 시도
 * - 최종 Authorization 헤더 반환
 */
const getAuthorizedHeaders = async (): Promise<HeadersInit> => {
    let token = await AsyncStorage.getItem('accessToken');
    let headers = { Authorization: `Bearer ${token}` };

    // 🟡 accessToken 테스트 → 만료되었으면 refresh 시도
    const test = await fetch(`${API_BASE_URL}/me`, { headers });
    if (test.status === 401) {
        // 🔁 Refresh 토큰으로 재발급 시도
        const newToken = await reissueAccessToken();
        if (newToken) {
            token = newToken;
            headers = { Authorization: `Bearer ${token}` };
        } else {
            // ❌ 재발급 실패 시 에러 발생
            throw new Error('토큰이 만료되었습니다. 다시 로그인해주세요.');
        }
    }

    return headers;
};


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
 * - accessToken 헤더 포함
 * - 토큰 만료 시 자동 갱신 포함
 */
export const fetchUserData = async (): Promise<UserData> => {
    try {
        const headers = await getAuthorizedHeaders();

        const response = await fetch(`${API_BASE_URL}/me`, { headers });

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
 * ✅ 사용자 정보 수정 API
 * @param updateData 닉네임, 이름 등 변경할 필드
 * @param profileImage 새 프로필 이미지 (선택)
 * - multipart/form-data 형식 전송
 * - accessToken 포함 + 만료 시 갱신 처리
 */
export const updateUser = async (
    updateData: {
        nickName?: string;
        name?: string;
    },
    profileImage?: { uri: string; name: string; type: string } // 🔵 변경된 타입
) => {
    try {
        const headers = await getAuthorizedHeaders();

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
            headers,
            body: formData,
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
