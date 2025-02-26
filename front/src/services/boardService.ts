import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8080/api/v1/boards';

/**
 * ✅ 게시글 등록 API
 * @param data 게시글 등록 요청 데이터 (제목, 내용, 이미지 URL)
 * @returns 생성된 게시글 상세 정보
 * @throws 게시글 등록 실패 시 오류 발생
 */
export const createBoard = async (data: { title: string; content: string; imageUrl?: string }) => {
    const token = await AsyncStorage.getItem('userToken'); // 🔵 토큰 가져오기
    if (!token) {throw new Error('로그인이 필요합니다.');}

    const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // 🔵 인증 추가
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '게시글 등록 실패');
    }

    return await response.json();
};

/**
 * ✅ 게시글 상세 조회 API
 * @param boardId 게시글 ID
 * @returns 게시글 상세 정보 반환
 * @throws 게시글 조회 실패 시 오류 발생
 */
export const getBoardDetail = async (boardId: number) => {
    const response = await fetch(`${API_BASE_URL}/${boardId}`);

    if (!response.ok) {throw new Error('게시글 조회 실패');}
    return await response.json();
};

/**
 * ✅ 모든 게시글 목록 조회 API
 * @returns 게시글 목록 배열 반환
 * @throws 게시글 목록 조회 실패 시 오류 발생
 */
export const getBoardList = async () => {
    const response = await fetch(`${API_BASE_URL}`);

    if (!response.ok) {throw new Error('게시글 목록 조회 실패');}
    return await response.json();
};

/**
 * ✅ 특정 회원의 게시글 목록 조회 API
 * @param memberId 회원 ID
 * @returns 특정 회원의 게시글 목록 배열 반환
 * @throws 게시글 목록 조회 실패 시 오류 발생
 */
export const getBoardsByMember = async (memberId: number) => {
    const response = await fetch(`${API_BASE_URL}/member/${memberId}`);

    if (!response.ok) {throw new Error('회원의 게시글 목록 조회 실패');}
    return await response.json();
};

/**
 * ✅ 게시글 수정 API
 * @param boardId 게시글 ID
 * @param data 수정할 게시글 데이터 (제목, 내용, 이미지 URL)
 * @returns 수정된 게시글 객체 반환
 * @throws 게시글 수정 실패 시 오류 발생
 */
export const updateBoard = async (boardId: number, data: { title?: string; content?: string; imageUrl?: string }) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {throw new Error('로그인이 필요합니다.');}

    const response = await fetch(`${API_BASE_URL}/${boardId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '게시글 수정 실패');
    }

    return await response.json();
};

/**
 * ✅ 게시글 삭제 API
 * @param boardId 게시글 ID
 * @throws 게시글 삭제 실패 시 오류 발생
 */
export const deleteBoard = async (boardId: number) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {throw new Error('로그인이 필요합니다.');}

    const response = await fetch(`${API_BASE_URL}/${boardId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {throw new Error('게시글 삭제 실패');}
};
