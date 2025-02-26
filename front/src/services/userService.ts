import AsyncStorage from '@react-native-async-storage/async-storage';


const API_BASE_URL = 'http://localhost:8080/api/v1/auth'; // 🟢 백엔드 API 주소

export interface UserData {
    id: string;
    name: string;
    email: string;
    nickName: string;
    profileImageUrl: string;
    petList: { id: string; name: string; imageUrl: string }[];
    recentPosts: { id: string; title: string; content: string; imageUrl: string }[];
}

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

        if (!response.ok) throw new Error('사용자 정보를 불러오지 못했습니다.');
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
    profileImageUrl?: string;
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
