import AsyncStorage from '@react-native-async-storage/async-storage';


const API_BASE_URL = 'http://localhost:8080/api/v1/auth'; // 🟢 백엔드 API 주소

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

        if (!response.ok) { throw new Error('사용자 정보를 불러오지 못했습니다.'); }
        return await response.json();
    } catch (error) {
        console.error('❌ 사용자 데이터 로드 실패:', error);
        throw error;
    }
};

/**
 * ✅ 사용자 정보 수정 API
 * @param updateData 변경할 사용자 정보 객체
 * @returns 수정된 사용자 정보
 */
export const updateUser = async (updateData: {
    name?: string;
    nickName?: string;
    profileImage?: string;
}) => {
    try {
        console.log('📤 사용자 정보 수정 요청:', updateData);

        const token = await AsyncStorage.getItem('userToken');
        if (!token) throw new Error('토큰이 없습니다.');

        const response = await fetch(`${API_BASE_URL}/me`, {
            method: 'PATCH', // PATCH 요청 (수정)
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updateData),
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
