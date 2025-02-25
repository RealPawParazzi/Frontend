import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8080/pets';

/**
 * ✅ 반려동물 등록 API
 * @param userId 회원 ID
 * @param data 반려동물 등록 데이터 (이름, 종, 나이, 프로필 이미지 URL)
 * @returns 등록된 반려동물 객체 반환
 * @throws 반려동물 등록 실패 시 오류 발생
 */
export const registerPet = async (
    userId: number,
    data: { name: string; breed: string; age: number; profileImageUrl?: string } // $$$$$$$ 프로필 이미지 추가
) => {
    const token = await AsyncStorage.getItem('userToken'); // 토큰 추가
    const response = await fetch(`${API_BASE_URL}/${userId}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // 인증 추가
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '반려동물 등록 실패'); // 상세 오류 메시지 처리
    }

    return await response.json();
};

/**
 * ✅ 특정 회원의 반려동물 목록 조회 API
 * @param userId 회원 ID
 * @returns 반려동물 목록 배열 반환
 * @throws 반려동물 목록 조회 실패 시 오류 발생
 */
export const getPetList = async (userId: number) => {
    const token = await AsyncStorage.getItem('userToken'); // 토큰 추가
    const response = await fetch(`${API_BASE_URL}/${userId}/all`, {
        headers: { Authorization: `Bearer ${token}` }, // 인증 추가
    });

    if (!response.ok) {throw new Error('반려동물 목록 조회 실패');}
    return await response.json();
};

/**
 * ✅ 특정 반려동물 상세 조회 API
 * @param petId 반려동물 ID
 * @returns 반려동물 상세 정보 반환
 * @throws 반려동물 상세 조회 실패 시 오류 발생
 */
export const getPetDetail = async (petId: number) => {
    const token = await AsyncStorage.getItem('userToken'); // 토큰 추가
    const response = await fetch(`${API_BASE_URL}/${petId}`, {
        headers: { Authorization: `Bearer ${token}` }, // 인증 추가
    });

    if (!response.ok) {throw new Error('반려동물 상세 조회 실패');}
    return await response.json();
};

/**
 * ✅ 반려동물 정보 수정 API
 * @param petId 반려동물 ID
 * @param data 수정할 반려동물 정보 (이름, 종, 나이, 프로필 이미지 URL)
 * @returns 수정된 반려동물 객체 반환
 * @throws 반려동물 정보 수정 실패 시 오류 발생
 */
export const updatePet = async (
    petId: number,
    data: { name?: string; breed?: string; age?: number; profileImageUrl?: string } // 프로필 이미지 추가
) => {
    const token = await AsyncStorage.getItem('userToken'); // 토큰 추가
    const response = await fetch(`${API_BASE_URL}/${petId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // 인증 추가
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '반려동물 정보 수정 실패'); // 상세 오류 메시지 처리
    }

    return await response.json();
};

/**
 * ✅ 반려동물 삭제 API
 * @param petId 반려동물 ID
 * @throws 반려동물 삭제 실패 시 오류 발생
 */
export const deletePet = async (petId: number) => {
    const token = await AsyncStorage.getItem('userToken'); // 토큰 추가
    const response = await fetch(`${API_BASE_URL}/${petId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }, // 인증 추가
    });

    if (!response.ok) {throw new Error('반려동물 삭제 실패');}
};
