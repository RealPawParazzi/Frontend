// followService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** 📌 API 기본 URL */
const BASE_URL = 'http://localhost:8080/api/follow';

/** ✅ 토큰 가져오기 */
const getAuthHeaders = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            throw new Error('❌ [인증 오류] 로그인 정보가 없습니다.');
        }
        return { Authorization: `Bearer ${token}` };
    } catch (error) {
        console.error('❌ [토큰 가져오기 실패]:', error);
        throw new Error('❌ [토큰 가져오기 실패]');
    }
};

/**
 * ✅ 에러 메시지 안전하게 가져오는 함수
 */
const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || '서버 요청 중 오류가 발생했습니다.';
    } else if (error instanceof Error) {
        return error.message;
    }
    return '알 수 없는 오류가 발생했습니다.';
};

/**
 * ✅ 특정 유저 팔로우 요청
 * @param targetId 팔로우할 유저 ID
 */
export const followUser = async (targetId: number) => {
    try {
        console.log(`📤 [팔로우 요청] -> ${targetId}`);
        const headers = await getAuthHeaders();
        const response = await axios.post(`${BASE_URL}/${targetId}`, {}, { headers });

        if (!response.data) {
            throw new Error('❌ [팔로우 실패] 응답 데이터가 없습니다.');
        }

        console.log('✅ [팔로우 성공]', response.data);
        return response.data;
    } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        console.error(`❌ [팔로우 실패]: ${errorMessage}`, error);
        throw new Error(errorMessage);
    }
};

/**
 * ✅ 특정 유저 언팔로우 요청
 * @param targetId 언팔로우할 유저 ID
 */
export const unfollowUser = async (targetId: number) => {
    try {
        console.log(`📤 [언팔로우 요청] -> ${targetId}`);
        const headers = await getAuthHeaders();
        await axios.delete(`${BASE_URL}/${targetId}`, { headers });
        console.log('✅ [언팔로우 성공]');
    } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        console.error(`❌ [언팔로우 실패]: ${errorMessage}`, error);
        throw new Error(errorMessage);
    }
};

/**
 * ✅ 특정 유저의 팔로워 목록 가져오기
 * @param targetId 조회할 유저 ID
 */
export const getFollowers = async (targetId: number) => {
    try {
        console.log(`📥 [팔로워 목록 요청] -> ${targetId}`);
        const response = await axios.get(`${BASE_URL}/followers/${targetId}`);

        if (!response.data || !Array.isArray(response.data)) {
            console.warn('⚠️ [팔로워 목록 경고] 데이터가 비어있거나 올바른 형식이 아닙니다.');
            return [];
        }

        console.log('✅ [팔로워 목록 가져오기 성공]', response.data);
        return response.data;
    } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        console.error(`❌ [팔로워 목록 가져오기 실패]: ${errorMessage}`, error);
        return [];
    }
};

/**
 * ✅ 특정 유저의 팔로잉 목록 가져오기
 * @param targetId 조회할 유저 ID
 */
export const getFollowing = async (targetId: number) => {
    try {
        console.log(`📥 [팔로잉 목록 요청] -> ${targetId}`);
        const response = await axios.get(`${BASE_URL}/following/${targetId}`);

        if (!response.data || !Array.isArray(response.data)) {
            console.warn('⚠️ [팔로잉 목록 경고] 데이터가 비어있거나 올바른 형식이 아닙니다.');
            return [];
        }

        console.log('✅ [팔로잉 목록 가져오기 성공]', response.data);
        return response.data;
    } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        console.error(`❌ [팔로잉 목록 가져오기 실패]: ${errorMessage}`, error);
        return [];
    }
};

