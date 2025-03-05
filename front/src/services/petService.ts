import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8080/api/pets';

/**
 * ✅ 반려동물 등록 API
 * @param data 반려동물 등록 데이터 (이름, 종, 나이, 프로필 이미지 URL)
 * @returns 등록된 반려동물 객체 반환
 * @throws 반려동물 등록 실패 시 오류 발생
 */
export const registerPet = async (
    data: { name: string; type: string; birthDate: string; petImg?: string }
) => {
    const token = await AsyncStorage.getItem('userToken'); // 🔑 토큰 가져오기
    if (!token) { throw new Error('로그인이 필요합니다.'); }

    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // ✅ 인증 토큰 포함
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('반려동물 등록 실패');
    }

    return await response.json();
};



/**
 * ✅ 특정 회원의 반려동물 목록 조회 API
 * @returns 반려동물 목록 배열 반환
 * @throws 반려동물 목록 조회 실패 시 오류 발생
 */
export const getPetList = async () => { // ✅ userId 제거
    const token = await AsyncStorage.getItem('userToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }

    const response = await fetch(`${API_BASE_URL}/all`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error('반려동물 목록 조회 실패');
    }

    return await response.json();
};

/**
 * ✅ 특정 반려동물 상세 조회 API
 * @param petId 반려동물 ID
 * @returns 반려동물 상세 정보 반환
 * @throws 반려동물 상세 조회 실패 시 오류 발생
 */
export const getPetDetail = async (petId: number) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }

    const response = await fetch(`${API_BASE_URL}/${petId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error('반려동물 상세 조회 실패');
    }

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
    data: { name?: string; type?: string; birthDate?: string; petImg?: string }
) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }

    const response = await fetch(`${API_BASE_URL}/${petId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('반려동물 정보 수정 실패');
    }

    return await response.json();
};

/**
 * ✅ 반려동물 삭제 API
 * @param petId 반려동물 ID
 * @throws 반려동물 삭제 실패 시 오류 발생
 */
export const deletePet = async (petId: number) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }

    const response = await fetch(`${API_BASE_URL}/${petId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error('반려동물 삭제 실패');
    }
};
