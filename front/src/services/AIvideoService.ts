// services/AIvideoService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_ROOT_URL} from '../config/apiConfig';

const API_BASE_URL = `${API_ROOT_URL}/videos`;

interface CreateResponse {
  requestId: number;
  jobId: string;
}

interface StatusResponse {
  requestId: number;
  jobId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  resultUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  errorMessage: string | null;
}

export interface GeneratedVideo {
  requestId: number;
  createdAt: string;
  updatedAt: string;
  prompt: string;
  imageUrl: string[];
  resultUrl: string | null;
}

/**
 * POST /api/videos
 * form-data: { request: JSON, image: File }
 */
export async function createVideoRequest(
  prompt: string,
  duration: number,
  imageFile: {uri: string; name: string; type: string},
): Promise<CreateResponse> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  const form = new FormData();
  form.append(
    'request',
    JSON.stringify({
      prompt,
      duration: Number(duration), // 명시적으로 숫자로 변환
    }),
  );
  form.append('image', {
    uri: imageFile.uri,
    name: imageFile.name,
    type: imageFile.type,
  } as any);

  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`},
    body: form,
  });
  if (!res.ok) {
    let errMessage = '영상 생성 요청 실패';
    try {
      const err = await res.json();
      errMessage = err.message || errMessage;
    } catch {
      // JSON 파싱 실패 시 기본 메시지 유지
    }
    throw new Error(errMessage);
  }
  return await res.json();
}

/**
 * GET /api/videos/status/{jobId}
 */
export async function fetchVideoStatus(jobId: string): Promise<StatusResponse> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  const res = await fetch(`${API_BASE_URL}/status/${jobId}`, {
    headers: {Authorization: `Bearer ${token}`},
  });
  if (!res.ok) {
    let errMessage = '상태 조회 실패';
    try {
      const err = await res.json();
      errMessage = err.message || errMessage;
    } catch {
      // JSON 파싱 실패 시 기본 메시지 유지
    }
    throw new Error(errMessage);
  }
  return await res.json();
}

/**
 * POST /api/videos/{battleId}
 */
export async function createBattleVideoRequest(
  battleId: number | undefined,
): Promise<CreateResponse> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  const res = await fetch(`${API_BASE_URL}/${battleId}`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`},
  });

  if (!res.ok) {
    let errMessage = '배틀 영상 생성 실패';
    try {
      const err = await res.json();
      errMessage = err.message || errMessage;
    } catch {}
    throw new Error(errMessage);
  }

  return await res.json();
}

export async function fetchAllGeneratedVideos(): Promise<GeneratedVideo[]> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  const res = await fetch(`${API_BASE_URL}/all`, {
    headers: {Authorization: `Bearer ${token}`},
  });

  if (!res.ok) {
    let errMessage = '영상 목록 조회 실패';
    try {
      const err = await res.json();
      errMessage = err.message || errMessage;
    } catch {}
    throw new Error(errMessage);
  }

  const allVideos = await res.json();
  return allVideos.filter((v: GeneratedVideo) => v.resultUrl !== null);
}

export async function fetchLatestBattleVideoByPet(
  petId: number,
): Promise<GeneratedVideo | null> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  const res = await fetch(`${API_BASE_URL}/${petId}`, {
    headers: {Authorization: `Bearer ${token}`},
  });

  if (!res.ok) {
    let errMessage = '최근 배틀 영상 조회 실패';
    try {
      const err = await res.json();
      errMessage = err.message || errMessage;
    } catch {}
    throw new Error(errMessage);
  }

  const data = await res.json();
  return data.resultUrl || null;
}


/**
 * DELETE /api/videos/{requestId}
 * 생성한 비디오 삭제
 */
export async function deleteGeneratedVideo(requestId: number): Promise<void> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  const res = await fetch(`${API_BASE_URL}/${requestId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let errMessage = '영상 삭제 실패';
    try {
      const err = await res.json();
      errMessage = err.message || errMessage;
    } catch {
      // JSON 파싱 실패 시 기본 메시지 유지
    }
    throw new Error(errMessage);
  }
}
