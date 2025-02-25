import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8080/api/v1/boards';

/**
 * ✅ 게시글 등록 API
 * @param data 게시글 생성 데이터 (제목, 내용)
 * @returns 생성된 게시글 객체 반환
 * @throws 게시글 등록 실패 시 오류 발생
 */
export const createBoard = async (data: { title: string; content: string }) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {throw new Error('토큰이 없습니다.');}

    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });

    if (!response.ok) {throw new Error('게시글 등록 실패');}
    return await response.json();
};

/**
 * ✅ 게시글 상세 조회 API
 * @param boardId 조회할 게시글 ID
 * @returns 게시글 상세 정보 반환
 * @throws 게시글 조회 실패 시 오류 발생
 */
export const getBoardDetail = async (boardId: number) => {
    const response = await fetch(`${API_BASE_URL}/${boardId}`);

    if (!response.ok) {throw new Error('게시글 조회 실패');}
    return await response.json();
};

/**
 * ✅ 게시글 목록 조회 API
 * @returns 게시글 목록 배열 반환
 * @throws 게시글 목록 조회 실패 시 오류 발생
 */
export const getBoardList = async () => {
    const response = await fetch(API_BASE_URL);

    if (!response.ok) {throw new Error('게시글 목록 조회 실패');}
    return await response.json();
};
