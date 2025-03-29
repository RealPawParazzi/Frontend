import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 🔹 백엔드 API 기본 URL
const API_BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/pets'  // 안드로이드용
    : 'http://localhost:8080/api/pets'; // iOS용

/**
 * ✅ 반려동물 등록 API
 * @returns 등록된 반려동물 객체 반환
 * @throws 반려동물 등록 실패 시 오류 발생
 * @param petData
 * @param petImage
 */
export const registerPet = async (
    petData: { name: string; type: string; birthDate: string },
    petImage?: { uri: string; name: string; type: string }
) => {
    const token = await AsyncStorage.getItem('accessToken'); // 🔑 토큰 가져오기
    if (!token) { throw new Error('로그인이 필요합니다.'); }

    const formData = new FormData();
    formData.append('petData', JSON.stringify(petData)); // ✅ data라는 필드로 JSON 데이터를 전송 (서버가 요구한 이름 사용)

    if (petImage && petImage.uri) {
        formData.append('petImage', {
            uri: String(petImage.uri),
            name: String(petImage.name || 'petProfile.jpg'),
            type: String(petImage.type || 'image/jpeg'),
        } as any); // 🚩🚩🚩 as any 캐스팅 필수 (React Native 호환성)
    }

    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            // Content-Type은 FormData가 자동으로 처리 (명시하면 에러 발생)
        },
        body: formData,
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
    const token = await AsyncStorage.getItem('accessToken');
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
 * @param petData
 * @param petImage
 * @returns 수정된 반려동물 객체 반환
 * @throws 반려동물 정보 수정 실패 시 오류 발생
 */
export const updatePet = async (
    petId: number,
    petData: Partial<{ name: string; type: string; birthDate: string }>,
    petImage?: { uri: string; name: string; type: string }
) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }

    const formData = new FormData();

    if (Object.keys(petData).length > 0) {
        formData.append('petData', JSON.stringify(petData)); // 부분 업데이트 JSON
    }

    if (petImage && petImage.uri) {
        formData.append('petImage', {
            uri: String(petImage.uri),
            name: String(petImage.name || 'updated_pet.jpg'),
            type: String(petImage.type || 'image/jpeg'),
        } as any); // 🚩🚩🚩 타입 캐스팅 필수
    }

    const response = await fetch(`${API_BASE_URL}/${petId}`, {
        method: 'PATCH', // 변경된 부분 PATCH로 요청
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
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
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }

    const response = await fetch(`${API_BASE_URL}/${petId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error('반려동물 삭제 실패');
    }
};
