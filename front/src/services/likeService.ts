import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** 📌 API 기본 URL */
const BASE_URL = 'http://localhost:8080/api/v1';

/** ✅ 토큰 가져오기 */
const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }
    return { Authorization: `Bearer ${token}` };
};

/** 🟠 1. 게시글 좋아요 관련 API */
/**
 * ✅ 게시글 좋아요 토글
 * @param boardId 게시글 ID
 * @returns { liked: boolean, favoriteCount: number }
 */
export const toggleBoardLike = async (boardId: number) => {
    try {
        console.log(`📤 [게시글 좋아요 토글] -> ${boardId}`);
        const headers = await getAuthHeaders();
        const response = await axios.post(`${BASE_URL}/likes/${boardId}`, {}, { headers });
        console.log('✅ [게시글 좋아요 변경 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [게시글 좋아요 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 특정 게시글의 좋아요 목록 가져오기
 * @param boardId 게시글 ID
 */
export const getBoardLikes = async (boardId: number) => {
    try {
        console.log(`📥 [게시글 좋아요 목록 요청] -> ${boardId}`);
        const response = await axios.get(`${BASE_URL}/likes/${boardId}`);
        console.log('✅ [게시글 좋아요 목록 가져오기 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [게시글 좋아요 목록 가져오기 실패]:', error);
        throw error;
    }
};

/** 🟢 2. 댓글 좋아요 관련 API */
/**
 * ✅ 댓글 좋아요 토글
 * @param commentId 댓글 ID
 * @returns { liked: boolean, commentsLikeCount: number }
 */
export const toggleCommentLike = async (commentId: number) => {
    try {
        console.log(`📤 [댓글 좋아요 토글] -> ${commentId}`);
        const headers = await getAuthHeaders();
        const response = await axios.post(`${BASE_URL}/comments/${commentId}/like`, {}, { headers });
        console.log('✅ [댓글 좋아요 변경 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [댓글 좋아요 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 특정 댓글의 좋아요 목록 가져오기
 * @param commentId 댓글 ID
 */
export const getCommentLikes = async (commentId: number) => {
    try {
        console.log(`📥 [댓글 좋아요 목록 요청] -> ${commentId}`);
        const response = await axios.get(`${BASE_URL}/comments/${commentId}/likes`);
        console.log('✅ [댓글 좋아요 목록 가져오기 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [댓글 좋아요 목록 가져오기 실패]:', error);
        throw error;
    }
};

/** 🔵 3. 대댓글 좋아요 관련 API */
/**
 * ✅ 대댓글 좋아요 토글
 * @param replyId 대댓글 ID
 * @returns { liked: boolean, commentsLikeCount: number }
 */
export const toggleReplyLike = async (replyId: number) => {
    try {
        console.log(`📤 [대댓글 좋아요 토글] -> ${replyId}`);
        const headers = await getAuthHeaders();
        const response = await axios.post(`${BASE_URL}/replies/${replyId}/like`, {}, { headers });
        console.log('✅ [대댓글 좋아요 변경 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [대댓글 좋아요 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 특정 대댓글의 좋아요 목록 가져오기
 * @param replyId 대댓글 ID
 */
export const getReplyLikes = async (replyId: number) => {
    try {
        console.log(`📥 [대댓글 좋아요 목록 요청] -> ${replyId}`);
        const response = await axios.get(`${BASE_URL}/replies/${replyId}/likes`);
        console.log('✅ [대댓글 좋아요 목록 가져오기 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [대댓글 좋아요 목록 가져오기 실패]:', error);
        throw error;
    }
};
