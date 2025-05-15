// services/AIvideoService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/videos'
    : 'http://localhost:8080/api/videos';

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

/**
 * POST /api/videos
 * form-data: { request: JSON, image: File }
 */
export async function createVideoRequest(
    prompt: string,
    duration: number,
    imageFile: { uri: string; name: string; type: string }
): Promise<CreateResponse> {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }

    const form = new FormData();
    form.append('request', JSON.stringify({
        prompt,
        duration: Number(duration), // 명시적으로 숫자로 변환
    }));
    form.append('image', {
        uri: imageFile.uri,
        name: imageFile.name,
        type: imageFile.type,
    } as any);

    const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
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
export async function fetchVideoStatus(
    jobId: string
): Promise<StatusResponse> {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }

    const res = await fetch(`${API_BASE_URL}/status/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
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