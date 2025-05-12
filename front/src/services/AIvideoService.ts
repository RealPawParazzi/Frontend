// 📁 services/AIvideoService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';


// 🔹 백엔드 API 기본 URL
const API_BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/videos'  // 안드로이드용
    : 'http://localhost:8080/api/videos'; // iOS용

/** ✅ AI 비디오 생성 요청 */
export const requestAIVideo = async (prompt: string, duration: string, imageFile: File) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }

    const formData = new FormData();
    formData.append('request', JSON.stringify({ prompt, duration }));
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) { throw new Error('영상 생성 요청 실패'); }
    return await response.json(); // { jobId, requestId }
};

/** ✅ 상태 확인 API */
export const fetchVideoStatus = async (jobId: string) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }

    const response = await fetch(`${API_BASE_URL}/status/${jobId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) { throw new Error('상태 확인 실패'); }
    return await response.json(); // { status, resultUrl, errorMessage, ... }
};