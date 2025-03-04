import { create } from 'zustand';
import { createBoard, getBoardList, getBoardDetail, updateBoard, deleteBoard, getBoardsByMember } from '../services/boardService';

/** 📌 게시글 데이터 타입 정의 */
interface Board {
    id: number;
    title: string;
    visibility: 'PUBLIC' | 'FOLLOWERS';
    titleImage: string;
    titleContent: string;
    writeDatetime: string;
    favoriteCount: number;
    commentCount: number;
    viewCount: number;
    author: {
        id: number;
        nickname: string;
        profileImageUrl: string;
    };
    contents?: { type: 'text' | 'image'; value: string }[]; // 상세 조회 시 포함됨
}

/** ✅ 기본 더미 데이터 */
const defaultBoard: Board = {
    id: 0,
    title: '게시글이 없습니다.',
    visibility: 'PUBLIC',
    titleImage: require('../assets/images/post-2.jpg'), // 기본 이미지
    titleContent: '현재 작성된 게시글이 없습니다.',
    writeDatetime: new Date().toISOString(),
    favoriteCount: 0,
    commentCount: 0,
    viewCount: 0,
    author: {
        id: 0,
        nickname: '익명',
        profileImageUrl: require('../assets/images/post-2.jpg'),
    },
    contents: [{ type: 'text', value: '등록된 내용이 없습니다.' }],
};

/** 📌 Zustand Store 정의 */
const boardStore = create<{
    boardList: any[];
    selectedBoard: any | null;
    fetchBoardList: () => Promise<void>;
    fetchBoardDetail: (boardId: number) => Promise<void>;
    createNewBoard: (data: any) => Promise<void>;
    updateExistingBoard: (boardId: number, data: any) => Promise<void>;
    deleteExistingBoard: (boardId: number) => Promise<void>;
    fetchUserBoards: (memberId: number) => Promise<void>;
}>((set) => ({
    /** ✅ 게시글 리스트 (초기값: 기본 더미 데이터) */
    boardList: [defaultBoard],

    /** ✅ 선택된 게시글 (초기값: 기본 더미 데이터) */
    selectedBoard: defaultBoard,

    /** 🔵 게시글 목록 가져오기 */
    fetchBoardList: async () => {
        try {
            const data = await getBoardList();
            set({ boardList: data });
        } catch (error) {
            console.error('❌ fetchBoardList 오류:', error);
        }
    },

    /** 🔵 특정 게시글 상세 조회 */
    fetchBoardDetail: async (boardId) => {
        try {
            const data = await getBoardDetail(boardId);
            set({ selectedBoard: data });
        } catch (error) {
            console.error('❌ fetchBoardDetail 오류:', error);
        }
    },

    /** 🔵 새로운 게시글 생성 */
    createNewBoard: async (data) => {
        try {
            const newBoard = await createBoard(data);
            set((state) => ({ boardList: [newBoard, ...state.boardList] }));
        } catch (error) {
            console.error('❌ createNewBoard 오류:', error);
        }
    },

    /** 🔵 기존 게시글 수정 */
    updateExistingBoard: async (boardId, data) => {
        try {
            const updatedBoard = await updateBoard(boardId, data);
            set((state) => ({
                boardList: state.boardList.map((board) => (board.id === boardId ? updatedBoard : board)),
                selectedBoard: updatedBoard,
            }));
        } catch (error) {
            console.error('❌ updateExistingBoard 오류:', error);
        }
    },

    /** 🔵 게시글 삭제 */
    deleteExistingBoard: async (boardId) => {
        try {
            await deleteBoard(boardId);
            set((state) => ({
                boardList: state.boardList.filter((board) => board.id !== boardId),
            }));
        } catch (error) {
            console.error('❌ deleteExistingBoard 오류:', error);
        }
    },

    /** 🔵 특정 회원의 게시글 목록 조회 */
    fetchUserBoards: async (memberId) => {
        try {
            if (!memberId) {
                throw new Error(`❌ 유효하지 않은 memberId: ${memberId}`); // ✅ memberId가 올바른지 확인
            }

            const data = await getBoardsByMember(memberId);
            if (data.length > 0) {
                set({ boardList: data }); // ✅ 정상적인 데이터가 있을 경우 업데이트
            } else {
                console.warn('⚠️ 게시글이 없어서 기본 데이터 설정됨.');
                set({ boardList: [defaultBoard] }); // ✅ 게시글이 없을 경우 기본 데이터 설정
            }

        } catch (error) {
            console.error('❌ 특정 회원의 게시글 목록 불러오기 실패:', error);
            set({ boardList: [defaultBoard] }); // ❌ 오류 발생 시 기본 데이터 반환
        }
    },
}));

/** ✅ 게시물 데이터 불러오기 */
export const loadBoardData = async (memberId: number) => {
    try {
        await boardStore.getState().fetchUserBoards(memberId);
    } catch (error) {
        console.error('📝❌ loadBoardData 실패:', error);
    }
};

export default boardStore;
