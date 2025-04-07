// 📁 services/placeService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ✅ 플랫폼에 따라 API 기본 주소 설정
const API_BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/place'
    : 'http://localhost:8080/api/place';

// ✅ 인증 헤더 생성 함수
const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

/** ✅ 즐겨찾는 장소 등록 */
export const createPlace = async (place: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
}) => {
    const headers = await getAuthHeaders();
    const response = await axios.post(API_BASE_URL, place, { headers });
    return response.data;
};

/** ✅ 즐겨찾기 전체 목록 조회 */
export const getPlaces = async () => {
    const headers = await getAuthHeaders();
    const response = await axios.get(API_BASE_URL, { headers });
    return response.data;
};

/** ✅ 특정 장소 상세 조회 */
export const getPlaceById = async (placeId: number) => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/${placeId}`, { headers });
    return response.data;
};

/** ✅ 장소 정보 수정 (부분 수정) */
export const updatePlace = async (placeId: number, data: Partial<{ name: string; address: string; latitude: number; longitude: number; }>) => {
    const headers = await getAuthHeaders();
    const response = await axios.patch(`${API_BASE_URL}/${placeId}`, data, { headers });
    return response.data;
};

/** ✅ 즐겨찾는 장소 삭제 */
export const deletePlace = async (placeId: number) => {
    const headers = await getAuthHeaders();
    await axios.delete(`${API_BASE_URL}/${placeId}`, { headers });
};
