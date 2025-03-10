import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** ✅ API 기본 URL */
const BASE_URL = 'http://localhost:8080/api/v1/walks';

/** ✅ 인증 헤더 가져오기 */
const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

/** ✅ 거리 계산 함수 (위도/경도를 이용) */
const calculateDistance = (route: { latitude: number; longitude: number }[]) => {
    let totalDistance = 0;
    for (let i = 1; i < route.length; i++) {
        const prev = route[i - 1];
        const curr = route[i];
        totalDistance += Math.sqrt(
            Math.pow(curr.latitude - prev.latitude, 2) + Math.pow(curr.longitude - prev.longitude, 2)
        ) * 111; // 1도당 약 111km
    }
    return totalDistance.toFixed(2);
};

/**
 * ✅ 산책 기록 저장 API
 * @param petId 반려동물 ID
 * @param walkData 산책 경로 데이터
 */
export const saveWalkData = async (petId: number, walkRoute: { latitude: number; longitude: number; timestamp: string }[], startTime: string, endTime: string) => {
    try {
        console.log(`📤 [산책 기록 저장] -> 반려동물 ID: ${petId}`);

        const headers = await getAuthHeaders();
        const distance = parseFloat(calculateDistance(walkRoute));
        const durationInHours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
        const averageSpeed = durationInHours > 0 ? (distance / durationInHours).toFixed(2) : 0;

        const requestBody = {
            petId,
            startTime,
            endTime,
            route: walkRoute,
            distance,
            averageSpeed,
        };

        const response = await axios.post(`${BASE_URL}/save`, requestBody, { headers });
        console.log('✅ [산책 기록 저장 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [산책 기록 저장 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 특정 반려동물의 산책 기록 가져오기
 * @param petId 반려동물 ID
 */
export const getWalkHistory = async (petId: number) => {
    try {
        console.log(`📥 [산책 기록 요청] -> 반려동물 ID: ${petId}`);
        const response = await axios.get(`${BASE_URL}/${petId}`);
        console.log('✅ [산책 기록 불러오기 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [산책 기록 불러오기 실패]:', error);
        throw error;
    }
};
