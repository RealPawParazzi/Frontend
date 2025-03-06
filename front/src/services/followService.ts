import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** 📌 API 기본 URL */
const BASE_URL = 'http://localhost:8080/api/follow';

/** ✅ 토큰 가져오기 */
const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }
    return { Authorization: `Bearer ${token}` };
};

/**
 * ✅ 특정 유저 팔로우 요청
 * @param targetNickName 팔로우할 유저 닉네임
 */
export const followUser = async (targetNickName: string) => {
    try {
        console.log(`📤 [팔로우 요청] -> ${targetNickName}`);
        const headers = await getAuthHeaders();
        const response = await axios.post(`${BASE_URL}/${targetNickName}`, {}, { headers });
        console.log('✅ [팔로우 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [팔로우 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 특정 유저 언팔로우 요청
 * @param targetNickName 언팔로우할 유저 닉네임
 */
export const unfollowUser = async (targetNickName: string) => {
    try {
        console.log(`📤 [언팔로우 요청] -> ${targetNickName}`);
        const headers = await getAuthHeaders();
        await axios.delete(`${BASE_URL}/${targetNickName}`, { headers });
        console.log('✅ [언팔로우 성공]');
    } catch (error) {
        console.error('❌ [언팔로우 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 특정 유저의 팔로워 목록 가져오기
 * @param nickName 조회할 유저 닉네임
 */
export const getFollowers = async (nickName: string) => {
    try {
        console.log(`📥 [팔로워 목록 요청] -> ${nickName}`);
        const response = await axios.get(`${BASE_URL}/followers/${nickName}`);
        console.log('✅ [팔로워 목록 가져오기 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [팔로워 목록 가져오기 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 특정 유저의 팔로잉 목록 가져오기
 * @param nickName 조회할 유저 닉네임
 */
export const getFollowing = async (nickName: string) => {
    try {
        console.log(`📥 [팔로잉 목록 요청] -> ${nickName}`);
        const response = await axios.get(`${BASE_URL}/following/${nickName}`);
        console.log('✅ [팔로잉 목록 가져오기 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [팔로잉 목록 가져오기 실패]:', error);
        throw error;
    }
};
