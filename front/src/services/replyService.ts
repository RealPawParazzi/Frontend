import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** 📌 API 기본 URL */
const BASE_URL = 'http://localhost:8080/api/v1/replies';

/** ✅ 토큰 가져오기 */
const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
        throw new Error('로그인이 필요합니다.');
    }
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

/**
 * ✅ 대댓글 작성
 * @param commentId 부모 댓글 ID
 * @param content 대댓글 내용
 * @returns {ReplyResponseDto} 생성된 대댓글 정보
 */
export const createReply = async (commentId: number, content: string) => {
    try {
        console.log(`📤 [대댓글 작성] -> 부모 댓글 ID: ${commentId}`);
        const headers = await getAuthHeaders();
        const response = await axios.post(`${BASE_URL}/${commentId}`, { content }, { headers });
        console.log('✅ [대댓글 작성 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [대댓글 작성 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 대댓글 수정
 * @param replyId 대댓글 ID
 * @param content 수정할 대댓글 내용
 * @returns {ReplyResponseDto} 수정된 대댓글 정보
 */
export const updateReply = async (replyId: number, content: string) => {
    try {
        console.log(`✏️ [대댓글 수정] -> 대댓글 ID: ${replyId}`);
        const headers = await getAuthHeaders();
        const response = await axios.put(`${BASE_URL}/${replyId}`, { content }, { headers });
        console.log('✅ [대댓글 수정 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [대댓글 수정 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 대댓글 삭제
 * @param replyId 대댓글 ID
 * @returns {string} 삭제 성공 메시지
 */
export const deleteReply = async (replyId: number) => {
    try {
        console.log(`🗑️ [대댓글 삭제] -> 대댓글 ID: ${replyId}`);
        const headers = await getAuthHeaders();
        const response = await axios.delete(`${BASE_URL}/${replyId}`, { headers });
        console.log('✅ [대댓글 삭제 성공]', response.data);
        return response.data.message;
    } catch (error) {
        console.error('❌ [대댓글 삭제 실패]:', error);
        throw error;
    }
};

/**
 * ✅ 특정 댓글의 대댓글 목록 가져오기
 * @param commentId 부모 댓글 ID
 * @returns {ReplyListResponseDto} 대댓글 목록
 */
export const getRepliesByComment = async (commentId: number) => {
    try {
        console.log(`📥 [댓글의 대댓글 목록 요청] -> 부모 댓글 ID: ${commentId}`);
        const response = await axios.get(`${BASE_URL}/${commentId}`);
        console.log('✅ [대댓글 목록 가져오기 성공]', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ [대댓글 목록 가져오기 실패]:', error);
        throw error;
    }
};
