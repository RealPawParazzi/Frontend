import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8080/api/v1/auth'; // 🟢 백엔드 API 주소

/**
 * ✅ 회원가입 API
 * @param data 회원가입 요청 데이터 (이메일, 비밀번호, 닉네임, 이름, 프로필 이미지 URL)
 * @throws 회원가입 실패 시 오류 발생
 */
export const registerUser = async (data: {
    email: string;
    password: string;
    nickName: string;
    name: string;
    profileImageUrl?: string; // 선택적 필드
}) => {
    try {
        console.log('📤 회원가입 요청:', data);

        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
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
 * ✅ 토큰 검증 API
 * @returns 토큰이 유효한지 여부 (true/false)
 */
export const validateToken = async (): Promise<boolean> => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {return false;}

        const response = await fetch(`${API_BASE_URL}/validate`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.ok;
    } catch {
        return false;
    }
};

/**
 * ✅ 현재 로그인된 사용자 정보 가져오기
 * @returns 사용자 정보 객체 반환
 * @throws 토큰이 없거나 유효하지 않을 경우 오류 발생
 */
export const fetchCurrentUser = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {throw new Error('토큰이 없습니다.');}

    const response = await fetch(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {throw new Error('사용자 정보를 가져오지 못했습니다.');}
    return await response.json();
};

/**
 * ✅ 사용자 정보 수정 API
 * @param updateData 변경할 사용자 정보 객체
 * @returns 수정된 사용자 정보
 */
export const updateUser = async (updateData: {
    nickName?: string;
    name?: string;
    profileImageUrl?: string;
}) => {
    try {
        console.log('📤 사용자 정보 수정 요청:', updateData);

        const token = await AsyncStorage.getItem('userToken');
        if (!token) {throw new Error('토큰이 없습니다.');}

        const response = await fetch(`${API_BASE_URL}/me`, {
            method: 'PATCH', // 수정 요청은 PATCH
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

/**
 * ✅ 회원 탈퇴 API
 * @returns 회원 탈퇴 성공 메시지 반환
 * @throws 실패 시 오류 발생
 */
export const deleteUser = async () => {
    try {
        console.log('📤 회원 탈퇴 요청');

        const token = await AsyncStorage.getItem('userToken');
        if (!token) {throw new Error('토큰이 없습니다.');}

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
