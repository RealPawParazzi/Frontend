import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 🔹 백엔드 API 기본 URL
const API_BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/boards'  // 안드로이드용
    : 'http://localhost:8080/api/boards'; // iOS용

/**
 * ✅ 게시글 등록 API
 * @param data 게시글 등록 요청 데이터 (제목, 내용, 이미지 URL)
 * @returns 생성된 게시글 상세 정보
 * @throws 게시글 등록 실패 시 오류 발생
 */
export const createBoard = async (data: { title: string; contents: { type: 'text' | 'image'; value: string }[] }) => {
    try {
        const token = await AsyncStorage.getItem('userToken'); // 🔑 토큰 가져오기
        if (!token) { throw new Error('로그인이 필요합니다.'); }

        // 🔹 titleImage 및 titleContent 자동 설정
        const titleImage = data.contents.find((c) => c.type === 'image')?.value || null;
        const titleContent = data.contents.find((c) => c.type === 'text')?.value || '내용 없음';

        const response = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ...data, titleImage, titleContent }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '게시글 등록 실패');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ createBoard 오류:', error);
        throw error;
    }
};

/**
 * ✅ 특정 게시글 상세 조회 API
 * @param boardId 게시글 ID
 * @returns 게시글 상세 정보 반환
 * @throws 게시글 조회 실패 시 오류 발생
 */
export const getBoardDetail = async (boardId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${boardId}`);
        if (!response.ok) { throw new Error('게시글 상세 조회 실패'); }

        return await response.json();
    } catch (error) {
        console.error('❌ getBoardDetail 오류:', error);
        throw error;
    }
};

/**
 * ✅ 모든 게시글 목록 조회 API
 * @returns 게시글 목록 배열 반환
 * @throws 게시글 목록 조회 실패 시 오류 발생
 */
export const getBoardList = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}`);
        if (!response.ok) { throw new Error('게시글 목록 조회 실패'); }
        return await response.json();
    } catch (error) {
        console.error('❌ getBoardList 오류:', error);
        throw error;
    }
};

/**
 * ✅ 특정 회원의 게시글 목록 조회 API ???? 백엔드에 에 있나..?
 * @param memberId 회원 ID
 * @returns 특정 회원의 게시글 목록 배열 반환
 * @throws 게시글 목록 조회 실패 시 오류 발생
 */
export const getBoardsByMember = async (memberId: number) => {
    const response = await fetch(`${API_BASE_URL}/member/${memberId}`);

    if (!response.ok) { throw new Error('회원의 게시글 목록 조회 실패'); }
    return await response.json();
};

/**
 * ✅ 게시글 수정 API
 * @param boardId 수정할 게시글 ID
 * @param data 수정할 내용 (title, contents, image)
 */
export const updateBoard = async (boardId: number, data: { title?: string; contents?: { type: 'text' | 'image'; value: string }[] }) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) { throw new Error('로그인이 필요합니다.'); }

        const response = await fetch(`${API_BASE_URL}/${boardId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) { throw new Error('게시글 수정 실패'); }
        return await response.json();
    } catch (error) {
        console.error('❌ updateBoard 오류:', error);
        throw error;
    }
};

/**
 * ✅ 게시글 삭제 API
 * @param boardId 삭제할 게시글 ID
 */
export const deleteBoard = async (boardId: number) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) { throw new Error('로그인이 필요합니다.'); }

        const response = await fetch(`${API_BASE_URL}/${boardId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) { throw new Error('게시글 삭제 실패'); }
    } catch (error) {
        console.error('❌ deleteBoard 오류:', error);
        throw error;
    }
};

/**
 * ✅ 게시글 좋아요 토글 API
 * @param boardId 게시글 ID
 * @returns { memberId: number, boardId: number, liked: boolean, favoriteCount: number }
 */
export const toggleLike = async (boardId: number) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) { throw new Error('로그인이 필요합니다.'); }

        const response = await fetch(`${API_BASE_URL}/${boardId}/like`, {
            method: 'POST', // ✅ 좋아요 및 취소 동일한 엔드포인트
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '좋아요 처리 실패');
        }

        const result = await response.json();

        console.log('🟢 좋아요 응답:', result); //  API 응답 디버깅 로그

        return result; //  API 응답 값 그대로 반환
    } catch (error) {
        console.error('❌ toggleLike 오류:', error);
        throw error;
    }
};

/**
 * ✅ 특정 게시글의 좋아요 누른 회원 목록 조회 API
 * @param boardId 게시글 ID
 * @returns { boardId: number, likesCount: number, likedMember: Array<{memberId: number, nickname: string, profileImageUrl: string}> }
 */
export const fetchLikes = async (boardId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${boardId}/likes`);
        if (!response.ok) { throw new Error('좋아요 목록 조회 실패'); }
        return await response.json();
    } catch (error) {
        console.error('❌ fetchLikes 오류:', error);
        throw error;
    }
};


