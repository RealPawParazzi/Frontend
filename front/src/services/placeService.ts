import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_ROOT_URL} from '../config/apiConfig';

// 📌 기본 API 경로
const API_BASE_URL = `${API_ROOT_URL}/place`;

/** ✅ 인증 헤더 직접 구성 */
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token)
    throw new Error('❌ [인증 오류] 토큰이 없습니다. 로그인 해주세요.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/** ✅ 즐겨찾기 장소 등록 */
export const createPlace = async (place: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(place),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`❌ [장소 등록 실패] ${res.status} - ${errText}`);
    }

    return await res.json();
  } catch (err) {
    console.error('🔥 [createPlace Error]', err);
    throw err;
  }
};

/** ✅ 즐겨찾기 전체 목록 조회 */
export const getPlaces = async () => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      throw new Error(`❌ [장소 목록 조회 실패] 상태 코드: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('🔥 [getPlaces Error]', err);
    throw err;
  }
};

/** ✅ 특정 장소 상세 조회 */
export const getPlaceById = async (placeId: number) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}/${placeId}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      throw new Error(
        `❌ [장소 상세 조회 실패] ID: ${placeId}, 상태 코드: ${res.status}`,
      );
    }

    return await res.json();
  } catch (err) {
    console.error('🔥 [getPlaceById Error]', err);
    throw err;
  }
};

/** ✅ 장소 정보 수정 (부분 수정 가능) */
export const updatePlace = async (
  placeId: number,
  data: Partial<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }>,
) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}/${placeId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errMsg = await res.text();
      throw new Error(`❌ [장소 수정 실패] ${res.status}: ${errMsg}`);
    }

    return await res.json();
  } catch (err) {
    console.error('🔥 [updatePlace Error]', err);
    throw err;
  }
};

/** ✅ 장소 삭제 */
export const deletePlace = async (placeId: number) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}/${placeId}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      throw new Error(
        `❌ [장소 삭제 실패] ID: ${placeId}, 상태 코드: ${res.status}`,
      );
    }

    // DELETE는 보통 204 No Content → 반환값 없음
    return;
  } catch (err) {
    console.error('🔥 [deletePlace Error]', err);
    throw err;
  }
};
