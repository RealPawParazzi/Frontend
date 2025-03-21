// followService.ts - API 통신 관련 서비스
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 🔹 백엔드 API 기본 URL
const API_BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/follow'  // 안드로이드용
    : 'http://localhost:8080/api/follow'; // iOS용

/**
 * ✅ JWT 토큰 가져오기
 * AsyncStorage에서 사용자 인증 토큰을 가져와 요청 헤더 생성
 * @returns {Promise<{Authorization: string}>} 인증 헤더 객체
 * @throws {Error} 토큰이 없거나 가져오기 실패 시 예외 발생
 */
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
 * ✅ 에러 메시지 안전하게 가져오는 유틸리티 함수
 * 다양한 에러 타입(Axios, 일반 Error)을 처리하여 일관된 메시지 반환
 * @param {unknown} error - 발생한 에러 객체
 * @returns {string} 사용자에게 표시할 에러 메시지
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
 * ✅ 특정 유저 팔로우 요청 함수
 * POST 요청을 통해 대상 유저를 팔로우하고 결과 반환
 * @param {number} targetId - 팔로우할 유저 ID
 * @returns {Promise<any>} 팔로우 성공 시 서버 응답 데이터
 * @throws {Error} 요청 실패 시 상세 에러 메시지와 함께 예외 발생
 */
export const followUser = async (targetId: number) => {
    try {
        console.log(`📤 [팔로우 요청] -> ${targetId}`);
        const headers = await getAuthHeaders();
        const response = await axios.post(`${API_BASE_URL}/${targetId}`, {}, { headers });

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
 * ✅ 특정 유저 언팔로우 요청 함수
 * @param {number} targetId - 언팔로우할 유저 ID
 * @returns {Promise<any>} 언팔로우 성공 시 서버 응답 데이터 (팔로워/팔로잉 수 포함)
 */
export const unfollowUser = async (targetId: number) => {
    try {
        console.log(`📤 [언팔로우 요청] -> ${targetId}`);
        const headers = await getAuthHeaders();
        const response = await axios.delete(`${API_BASE_URL}/${targetId}`, { headers });

        if (!response.data) {
            throw new Error('❌ [언팔로우 실패] 응답 데이터가 없습니다.');
        }

        console.log('✅ [언팔로우 성공]', response.data);
        return response.data;
    } catch (error: unknown) {
        console.error(`❌ [언팔로우 실패]:`, error);
        throw new Error('언팔로우 요청 중 오류가 발생했습니다.');
    }
};


/**
 * ✅ 특정 유저의 팔로워 목록 가져오기 함수
 * 대상 유저를 팔로우하는 사용자들의 목록 조회
 * @param {number} targetId - 조회할 유저 ID
 * @returns {Promise<Array>} 팔로워 목록 배열 (실패 시 빈 배열)
 */
export const getFollowers = async (targetId: number) => {
    try {
        console.log(`📥 [팔로워 목록 요청] -> ${targetId}`);
        const response = await axios.get(`${API_BASE_URL}/followers/${targetId}`);

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
 * ✅ 특정 유저의 팔로잉 목록 가져오기 함수
 * 대상 유저가 팔로우하는 사용자들의 목록 조회
 * @param {number} targetId - 조회할 유저 ID
 * @returns {Promise<Array>} 팔로잉 목록 배열 (실패 시 빈 배열)
 */
export const getFollowing = async (targetId: number) => {
    try {
        console.log(`📥 [팔로잉 목록 요청] -> ${targetId}`);
        const response = await axios.get(`${API_BASE_URL}/following/${targetId}`);

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

