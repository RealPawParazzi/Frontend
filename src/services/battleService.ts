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

// 🟡 기본 배틀 요청
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
    headers: {Authorization: `Bearer ${token}`},
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`배틀 요청 실패: ${errorText}`);
  }

  return await res.json();
}

// 🟡 배틀 상세 조회
export async function fetchBattleDetail(
  battleId: number,
): Promise<BattleDetail> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  const res = await fetch(`${API_BASE_URL}/${battleId}`, {
    method: 'GET',
    headers: {Authorization: `Bearer ${token}`},
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`배틀 상세 조회 실패: ${errorText}`);
  }

  return await res.json();
}

// 🟡 1명 즉석 생성 배틀
export async function requestOneInstanceBattle(
  targetPetId: number, // ✅ 상대 펫 ID
  petData: {name: string; type: string; petDetail: string},
  imageFile: {uri: string; name: string; type: string},
): Promise<BattleResponse> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  const form = new FormData();
  form.append('petData', JSON.stringify(petData));
  form.append('petImage', {
    uri: imageFile.uri,
    name: imageFile.name,
    type: imageFile.type,
  } as any);

  const res = await fetch(
    `${API_BASE_URL}/instance/createOne/${targetPetId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    },
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }
  return await res.json();
}

// 🟡 2명 즉석 생성 배틀
export async function requestTwoInstanceBattle(
  petData1: {name: string; type: string; petDetail: string},
  imageFile1: {uri: string; name: string; type: string},
  petData2: {name: string; type: string; petDetail: string},
  imageFile2: {uri: string; name: string; type: string},
): Promise<BattleResponse> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  const form = new FormData();
  form.append('petData1', JSON.stringify(petData1));
  form.append('petImage1', imageFile1 as any);
  form.append('petData2', JSON.stringify(petData2));
  form.append('petImage2', imageFile2 as any);

  const res = await fetch(`${API_BASE_URL}/instance/createTwo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
  return await res.json();
}
