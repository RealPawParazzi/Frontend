import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_ROOT_URL} from '../config/apiConfig';

// 🔹 백엔드 API 기본 URL
const API_BASE_URL = `${API_ROOT_URL}/api/diary`;

/** ✅ 토큰 가져오기 함수 */
const getAccessToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('accessToken');
};

/** ✅ AI 일기 생성 */
export const createAIDiary = async (title: string, content: string) => {
  const token = await getAccessToken();
  if (!token) {throw new Error('로그인이 필요합니다.');}

  const res = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({title, content}),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'AI 일기 생성 실패');
  }

  return await res.json();
};

/** ✅ 내 일기 전체 조회 */
export const fetchMyDiaries = async () => {
  const token = await getAccessToken();
  if (!token) {throw new Error('로그인이 필요합니다.');}

  const res = await fetch(`${API_BASE_URL}/my`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || '일기 목록 조회 실패');
  }

  return await res.json();
};

/** ✅ 일기 상세 조회 */
export const fetchDiaryDetail = async (diaryId: number) => {
  const token = await getAccessToken();
  if (!token) {throw new Error('로그인이 필요합니다.');}

  const res = await fetch(`${API_BASE_URL}/${diaryId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || '일기 상세 조회 실패');
  }

  return await res.json();
};

/** ✅ 일기 삭제 */
export const deleteDiary = async (diaryId: number) => {
  const token = await getAccessToken();
  if (!token) {throw new Error('로그인이 필요합니다.');}

  const res = await fetch(`${API_BASE_URL}/${diaryId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || '일기 삭제 실패');
  }

  return await res.json();
};
