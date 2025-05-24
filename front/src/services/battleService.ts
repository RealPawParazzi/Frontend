// 📦 services/battleService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_ROOT_URL} from '../config/apiConfig';

const API_BASE_URL = `${API_ROOT_URL}/battle`;

/** ✅ 공통 타입 정의 */
export interface PetData {
  name: string;
  type: string;
  birthDate?: string; // null or 생략 시 오늘 날짜
  petDetail: string;
}

export interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

/** ✅ 기본 배틀 응답 */
export interface BattleResponse {
  battleId: number;
  winner: string;
  result: string;
}

/** ✅ 상세 배틀 응답 */
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

/** ✅ 토큰 확인 유틸 */
async function getTokenOrThrow(): Promise<string> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  return token;
}

/** ✅ 기본 배틀 요청 */
export async function requestBattle(
  myPetId: number,
  targetPetId: number,
): Promise<BattleResponse> {
  const token = await getTokenOrThrow();
  const res = await fetch(`${API_BASE_URL}/${targetPetId}?myPetId=${myPetId}`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`},
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`배틀 실패: ${err}`);
  }

  return await res.json();
}

/** ✅ 배틀 상세 정보 조회 */
export async function fetchBattleDetail(
  battleId: number,
): Promise<BattleDetail> {
  const token = await getTokenOrThrow();
  const res = await fetch(`${API_BASE_URL}/${battleId}`, {
    method: 'GET',
    headers: {Authorization: `Bearer ${token}`},
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`배틀 상세 조회 실패: ${err}`);
  }

  return await res.json();
}

/** ✅ 즉석에서 한 명 생성 후 배틀 */
export async function requestOneInstanceBattle(
  targetPetId: number,
  petData: PetData,
  imageFile: ImageFile,
): Promise<BattleResponse> {
  const token = await getTokenOrThrow();
  const form = new FormData();

  form.append('petData', JSON.stringify(petData));
  form.append('petImage', {
    uri: imageFile.uri,
    name: imageFile.name,
    type: imageFile.type,
  } as any);

  const res = await fetch(`${API_BASE_URL}/instance/createOne/${targetPetId}`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`},
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`즉석 1명 배틀 실패: ${err}`);
  }

  return await res.json();
}

/** ✅ 즉석에서 두 명 생성 후 배틀 */
export async function requestTwoInstanceBattle(
  petData1: PetData,
  imageFile1: ImageFile,
  petData2: PetData,
  imageFile2: ImageFile,
): Promise<BattleResponse> {
  const token = await getTokenOrThrow();
  const form = new FormData();

  form.append('petData1', JSON.stringify(petData1));
  form.append('petImage1', {
    uri: imageFile1.uri,
    name: imageFile1.name,
    type: imageFile1.type,
  } as any);

  form.append('petData2', JSON.stringify(petData2));
  form.append('petImage2', {
    uri: imageFile2.uri,
    name: imageFile2.name,
    type: imageFile2.type,
  } as any);

  const res = await fetch(`${API_BASE_URL}/instance/createTwo`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`},
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`즉석 2명 배틀 실패: ${err}`);
  }

  return await res.json();
}
