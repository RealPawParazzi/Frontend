// 📦 services/battleService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_ROOT_URL} from '../config/apiConfig';

const API_BASE_URL = `${API_ROOT_URL}/battle`;

export interface BattleResponse {
  result: string;
  winner: string;
  runway_prompt: string;
}

export interface BattleDetail {
  battleId: number;
  winnerId: number;
  loserId: number;
  battleResult: string;
  runwayPrompt: string;
  pet1: {
    petId: number;
    name: string;
    type: string;
    petImg: string;
    winCount: number;
    loseCount: number;
  };
  pet2: {
    petId: number;
    name: string;
    type: string;
    petImg: string;
    winCount: number;
    loseCount: number;
  };
}

// ✅ 배틀 신청 (기존 펫끼리)
export async function requestBattle(
  myPetId: number,
  targetPetId: number,
): Promise<BattleResponse> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  const res = await fetch(`${API_BASE_URL}/${targetPetId}?myPetId=${myPetId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`배틀 요청 실패: ${errorText}`);
  }

  return await res.json();
}

// ✅ 배틀 상세 조회
export async function fetchBattleDetail(
  battleId: number,
): Promise<BattleDetail> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  const res = await fetch(`${API_BASE_URL}/${battleId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`배틀 상세 조회 실패: ${errorText}`);
  }

  return await res.json();
}
