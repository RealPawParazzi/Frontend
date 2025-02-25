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

// ✅ 현재 로그인된 사용자 정보 가져오기
export const fetchUserData = async (): Promise<UserData> => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) throw new Error('토큰이 없습니다.');

        const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('사용자 정보를 불러오지 못했습니다.');
        return await response.json();
    } catch (error) {
        console.error('❌ 사용자 데이터 로드 실패:', error);
        throw error;
    }
};

// ✅ 로그아웃 (토큰 삭제)
export const logoutUser = async () => {
    await AsyncStorage.removeItem('userToken');
};
