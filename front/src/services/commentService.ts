import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** 📌 API 기본 URL */
const BASE_URL = 'http://localhost:8080/api/v1/comments';

/** ✅ 토큰 가져오기 */
const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) { throw new Error('로그인이 필요합니다.'); }
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

/**
 * ✅ 댓글 작성
 * @param boardId 게시글 ID
 * @param content 댓글 내용
 * @returns {CommentResponseDto} 생성된 댓글 정보
 */
export const createComment = async (boardId: number, content: string) => {
    try {
        console.log(`📤 [댓글 작성] -> 게시글 ID: ${boardId}`);
        const headers = await getAuthHeaders();
        const response = await axios.post(`${BASE_URL}/${boardId}`, { content }, { headers });
        console.log('✅ [댓글 작성 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [댓글 작성 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 댓글 수정
 * @param commentId 댓글 ID
 * @param content 수정할 댓글 내용
 * @returns {CommentResponseDto} 수정된 댓글 정보
 */
export const updateComment = async (commentId: number, content: string) => {
    try {
        console.log(`✏️ [댓글 수정] -> 댓글 ID: ${commentId}`);
        const headers = await getAuthHeaders();
        const response = await axios.put(`${BASE_URL}/${commentId}`, { content }, { headers });
        console.log('✅ [댓글 수정 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [댓글 수정 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 댓글 삭제
 * @param commentId 댓글 ID
 * @returns {string} 삭제 성공 메시지
 */
export const deleteComment = async (commentId: number) => {
    try {
        console.log(`🗑️ [댓글 삭제] -> 댓글 ID: ${commentId}`);
        const headers = await getAuthHeaders();
        const response = await axios.delete(`${BASE_URL}/${commentId}`, { headers });
        console.log('✅ [댓글 삭제 성공]', response.data);
        return response.data.message;
    } catch (error) {
        console.error('❌ [댓글 삭제 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 특정 게시글의 댓글 목록 가져오기
 * @param boardId 게시글 ID
 * @returns {CommentListResponseDto} 댓글 목록
 */
export const getCommentsByBoard = async (boardId: number) => {
    try {
        console.log(`📥 [게시글 댓글 목록 요청] -> 게시글 ID: ${boardId}`);
        const response = await axios.get(`${BASE_URL}/${boardId}`);
        console.log('✅ [게시글 댓글 목록 가져오기 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [게시글 댓글 목록 가져오기 실패]:', error);
        throw error;
    }
};


/**
 * ✅ 댓글 좋아요 토글 API
 * @param commentId 댓글 ID
 * @returns { liked: boolean, commentsLikeCount: number }
 */
export const toggleCommentLike = async (commentId: number) => {
    try {
        console.log(`📤 [댓글 좋아요 토글] -> 댓글 ID: ${commentId}`);
        const headers = await getAuthHeaders();
        const response = await axios.post(`${BASE_URL}/${commentId}/like`, {}, { headers });
        console.log('✅ [댓글 좋아요 토글 성공]', response.data);
        return response.data; // { liked: boolean, commentsLikeCount: number }
    } catch (error) {
        console.error('❌ [댓글 좋아요 토글 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 특정 댓글의 좋아요 누른 회원 목록 조회 API
 * @param commentId 댓글 ID
 * @returns 좋아요 누른 회원 목록 및 좋아요 개수
 */
export const fetchCommentLikes = async (commentId: number) => {
    try {
        console.log(`📥 [댓글 좋아요 목록 요청] -> 댓글 ID: ${commentId}`);
        const response = await axios.get(`${BASE_URL}/${commentId}/likes`);
        console.log('✅ [댓글 좋아요 목록 가져오기 성공]', response.data);
        return response.data; // { commentId, likeCount, likedMembers }
    } catch (error) {
        console.error('❌ [댓글 좋아요 목록 가져오기 실패]:', error);
        throw error;
    }
};

