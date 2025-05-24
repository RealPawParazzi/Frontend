// 🔹 services/walkService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_ROOT_URL} from '../config/apiConfig';

// 🔹 API 기본 경로
const API_BASE_URL = `${API_ROOT_URL}/walk`;

// 🔹 공통 타입 정의
export interface WalkRoute {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface WalkRecordRequest {
  petId: number;
  startTime: string;
  endTime: string;
  route: WalkRoute[];
  distance: number;
  averageSpeed: number;
}

export interface WalkRecordResponse {
  id: number;
  startTime: string;
  endTime: string;
  route: WalkRoute[];
  distance: number;
  averageSpeed: number;
  memberId?: number;
  pet: {
    petId: number;
    name: string;
    type: string;
    petImg: string;
  };
}

// ✅ 인증 헤더 구성
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('❌ [인증 에러] accessToken이 존재하지 않습니다.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// ✅ 거리 계산 함수 (하버사인 공식)
const toRad = (value: number) => (value * Math.PI) / 180;
export const calculateDistance = (route: WalkRoute[]): number => {
  const R = 6371;
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    const prev = route[i - 1],
      curr = route[i];
    const dLat = toRad(curr.latitude - prev.latitude);
    const dLng = toRad(curr.longitude - prev.longitude);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(prev.latitude)) *
        Math.cos(toRad(curr.latitude)) *
        Math.sin(dLng / 2) ** 2;
    total += R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }
  return parseFloat(total.toFixed(2));
};

// ✅ 산책 기록 저장
export const saveWalkData = async (
  petId: number,
  walkRoute: WalkRoute[],
  startTime: string,
  endTime: string,
): Promise<WalkRecordResponse> => {
  try {
    const headers = await getAuthHeaders();
    const distance = calculateDistance(walkRoute);
    const duration = (Date.parse(endTime) - Date.parse(startTime)) / 3600000;
    const averageSpeed =
      duration > 0 ? parseFloat((distance / duration).toFixed(2)) : 0;

    const body: WalkRecordRequest = {
      petId,
      startTime,
      endTime,
      route: walkRoute,
      distance,
      averageSpeed,
    };

    const res = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ [산책 기록 저장 실패]', res.status, errorText);
      throw new Error(`[${res.status}] 산책 기록 저장 실패: ${errorText}`);
    }

    const data = await res.json();
    console.log('✅ [산책 기록 저장 성공]:', data);
    return data;
  } catch (err) {
    console.error('🔥 [saveWalkData 에러]:', err);
    throw err;
  }
};

// ✅ 산책 기록 단건 조회
export const getWalkHistory = async (
  walkId: number,
): Promise<WalkRecordResponse> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/${walkId}`, {
      method: 'GET',
      headers,
    });
    if (!res.ok) {
      const msg = await res.text();
      console.error('❌ [산책 기록 조회 실패]', res.status, msg);
      throw new Error(`산책 기록 불러오기 실패: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`🔥 [getWalkHistory] walkId=${walkId}`, err);
    throw err;
  }
};

// ✅ 산책 기록 삭제
export const deleteWalkHistory = async (walkId: number): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/${walkId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('❌ [산책 기록 삭제 실패]', res.status, text);
      throw new Error(`산책 기록 삭제 실패: ${res.status}`);
    }
    console.log(`🗑️ [삭제 완료] walkId=${walkId}`);
  } catch (err) {
    console.error(`🔥 [deleteWalkHistory] walkId=${walkId}`, err);
    throw err;
  }
};

// ✅ 특정 펫 전체 기록 조회
export const getWalksByPetId = async (
  petId: number,
): Promise<WalkRecordResponse[]> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/pet/${petId}`, {
      method: 'GET',
      headers,
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`❌ 펫 산책 기록 조회 실패: ${res.status} - ${msg}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`🔥 [getWalksByPetId] petId=${petId}`, err);
    throw err;
  }
};

// ✅ 날짜 기준 전체 기록 조회
export const getWalksByDate = async (
  date: string,
): Promise<WalkRecordResponse[]> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_BASE_URL}/date?date=${encodeURIComponent(date)}`,
      {method: 'GET', headers},
    );
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`❌ 날짜별 산책 기록 조회 실패: ${res.status} - ${msg}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`🔥 [getWalksByDate] date=${date}`, err);
    throw err;
  }
};

// ✅ 특정 펫의 특정 날짜 기록 조회
export const getPetWalksByDate = async (
  petId: number,
  date: string,
): Promise<WalkRecordResponse[]> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_BASE_URL}/pet/${petId}/date?date=${encodeURIComponent(date)}`,
      {
        method: 'GET',
        headers,
      },
    );
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(
        `❌ 펫 날짜별 산책 기록 조회 실패: ${res.status} - ${msg}`,
      );
    }
    return await res.json();
  } catch (err) {
    console.error(`🔥 [getPetWalksByDate] petId=${petId} date=${date}`, err);
    throw err;
  }
};

// ✅ 로그인한 유저의 전체 산책 기록
export const getMyAllWalks = async (): Promise<WalkRecordResponse[]> => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/my`, {
      method: 'GET',
      headers,
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`❌ 전체 산책 기록 조회 실패: ${res.status} - ${msg}`);
    }
    return await res.json();
  } catch (err) {
    console.error('🔥 [getMyAllWalks]', err);
    throw err;
  }
};
