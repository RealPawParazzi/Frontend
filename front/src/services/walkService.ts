import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 🔹 백엔드 API 기본 URL
const API_BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/walk'  // 안드로이드용
    : 'http://localhost:8080/api/walk'; // iOS용

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
    return parseFloat(totalDistance.toFixed(2)); // 소수점 2자리까지 반환
};

/**
 * ✅ 산책 기록 저장 API
 * @param petId 반려동물 ID
 * @param walkRoute 산책 경로 데이터
 * @param startTime 시작 시간
 * @param endTime 종료 시간
 */
export const saveWalkData = async (petId: number, walkRoute: { latitude: number; longitude: number; timestamp: string }[], startTime: string, endTime: string) => {
    try {
        console.log(`📤 [산책 기록 저장] -> 반려동물 ID: ${petId}`);

        const headers = await getAuthHeaders();
        const distance = calculateDistance(walkRoute);

        // ✅ new Date() 대신 Date.parse() 사용하여 안전한 변환
        const startMillis = Date.parse(startTime);
        const endMillis = Date.parse(endTime);

        if (isNaN(startMillis) || isNaN(endMillis)) {
            console.error('❌ [에러] startTime 또는 endTime이 올바른 날짜 형식이 아님:', { startTime, endTime });
        }

        const durationInHours = (endMillis - startMillis) / (1000 * 60 * 60);
        const averageSpeed = durationInHours > 0 ? parseFloat((distance / durationInHours).toFixed(2)) : 0;

        const requestBody = {
            petId,
            startTime,
            endTime,
            route: walkRoute.map((point) => ({
                latitude: point.latitude,
                longitude: point.longitude,
                timestamp: point.timestamp,
            })),
            distance,
            averageSpeed,
        };

        console.log('📤 [보내는 JSON 데이터]:', JSON.stringify(requestBody, null, 2));


        // API 경로 수정 (기존: /api/walks/save → 변경: /api/walk)
        const response = await axios.post(`${API_BASE_URL}`, requestBody, { headers });
        console.log('✅ [산책 기록 저장 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [산책 기록 저장 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 산책 기록 조회 API
 * @param walkId 산책 기록 ID
 */
export const getWalkHistory = async (walkId: number) => {
    try {
        console.log(`📥 [산책 기록 요청] -> 산책 ID: ${walkId}`);

        // ✅ 인증 헤더 가져오기
        const headers = await getAuthHeaders();

        // API 경로 수정 (기존: /api/walks/{petId} → 변경: /api/walk/{walkId})
        const response = await axios.get(`${API_BASE_URL}/${walkId}`, { headers });

        console.log('✅ [산책 기록 불러오기 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [산책 기록 불러오기 실패]:', error);
        throw error;
    }
};
