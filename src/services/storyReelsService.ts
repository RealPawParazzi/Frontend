// 📁 services/storyReelsService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ROOT_URL } from '../config/apiConfig';

// 🔹 백엔드 API 기본 URL
const API_BASE_URL = `${API_ROOT_URL}/stories`;


const getToken = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  // console.log(token);
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  return token;
};

// ✅ 스토리 등록 (FormData: mediaFile + caption)
export const uploadStory = async (
  mediaFile: {uri: string; name: string; type: string},
  caption?: string,
): Promise<number> => {
  const formData = new FormData();
  formData.append('mediaFile', {
    uri: mediaFile.uri,
    name: mediaFile.name,
    type: mediaFile.type,
  } as any);

  // ✅ 캡션은 선택이므로 있을 경우에만 추가
  if (caption) {
    formData.append('caption', caption);
  }

  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || '스토리 업로드 실패');
  }

  const data = await res.json();
  return data.data.storyId;
};

// 🔸 스토리 수정 API 함수 추가
export const updateStory = async (
  storyId: number,
  mediaFile: {uri: string; name: string; type: string},
  caption?: string,
): Promise<number> => {
  const formData = new FormData();
  formData.append('mediaFile', {
    uri: mediaFile.uri,
    name: mediaFile.name,
    type: mediaFile.type,
  } as any);

  if (caption) {
    formData.append('caption', caption);
  }

  const res = await fetch(`${API_BASE_URL}/${storyId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '스토리 수정 실패');
  }

  const data = await res.json();
  return data.data.storyId;
};

// ✅ 전체 사용자들의 스토리 그룹 조회 (스토리 보유한 사용자만 대상)
export const fetchGroupedStories = async () => {
  const res = await fetch(`${API_BASE_URL}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error('스토리 목록 조회 실패');
  }
  return (await res.json()).data;
};

// ✅ 스토리 상세 조회 (보면서 viewed 처리됨)
export const fetchStoryDetail = async (storyId: number) => {
  const res = await fetch(`${API_BASE_URL}/${storyId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error('스토리 상세 조회 실패');
  }
  return (await res.json()).data;
};

// ✅ 스토리 삭제
export const deleteStory = async (storyId: number) => {
  const res = await fetch(`${API_BASE_URL}/${storyId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error('스토리 삭제 실패');
  }
};

// ✅ 나의 스토리 목록 조회
export const fetchMyStories = async () => {
  const res = await fetch(`${API_BASE_URL}/my`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error('내 스토리 조회 실패');
  }
  return (await res.json()).data;
};

// ✅ 스토리 뷰어 목록 조회
export const fetchStoryViewers = async (storyId: number) => {
  const res = await fetch(`${API_BASE_URL}/${storyId}/viewers`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '스토리 뷰어 조회 실패');
  }

  const json = await res.json();

  return json.data.viewers; // ✅ 오직 배열만 반환하도록!
};
