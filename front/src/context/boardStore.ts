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
    titleImage: 'https://example.com/default-thumbnail.jpg', // 기본 이미지
    titleContent: '현재 작성된 게시글이 없습니다.',
    writeDatetime: new Date().toISOString(),
    favoriteCount: 0,
    commentCount: 0,
    viewCount: 0,
    author: {
        id: 0,
        nickname: '익명',
        profileImageUrl: 'https://example.com/default-profile.jpg',
    },
    contents: [{ type: 'text', value: '등록된 내용이 없습니다.' }],
};

/** 📌 Zustand Store 정의 */
const boardStore = create<{
    boardList: Board[];
    selectedBoard: Board;
    fetchBoardList: () => Promise<void>;
    fetchBoardDetail: (boardId: number) => Promise<void>;
    createNewBoard: (data: Omit<Board, 'id' | 'writeDatetime' | 'favoriteCount' | 'commentCount' | 'viewCount'>) => Promise<void>;
    updateExistingBoard: (boardId: number, data: Partial<Board>) => Promise<void>;
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
            set({ boardList: data.length ? data : [defaultBoard] }); // ✅ 값이 비어있으면 기본 데이터 반환
        } catch (error) {
            console.error('❌ 게시글 목록 불러오기 실패:', error);
            set({ boardList: [defaultBoard] }); // ❌ 오류 발생 시 기본 데이터 반환
        }
    },

    /** 🔵 특정 게시글 상세 조회 */
    fetchBoardDetail: async (boardId) => {
        try {
            const data = await getBoardDetail(boardId);
            set({ selectedBoard: data });
        } catch (error) {
            console.error('❌ 게시글 상세 불러오기 실패:', error);
            set({ selectedBoard: defaultBoard }); // ❌ 오류 발생 시 기본 데이터 반환
        }
    },

    /** 🔵 새로운 게시글 생성 */
    createNewBoard: async (data) => {
        try {
            const newBoard = await createBoard({
                ...data,  // 기존 데이터 유지
                content: data.contents?.[0]?.value || '내용 없음', // ✅ 첫 번째 `text` 내용을 `content`로 사용 (없으면 "내용 없음")
            });
            set((state) => ({ boardList: [newBoard, ...state.boardList] }));
        } catch (error) {
            console.error('❌ 게시글 생성 실패:', error);
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
            console.error('❌ 게시글 수정 실패:', error);
        }
    },

    /** 🔵 게시글 삭제 */
    deleteExistingBoard: async (boardId) => {
        try {
            await deleteBoard(boardId);
            set((state) => ({
                boardList: state.boardList.filter((board) => board.id !== boardId),
                selectedBoard: defaultBoard,
            }));
        } catch (error) {
            console.error('❌ 게시글 삭제 실패:', error);
        }
    },

    /** 🔵 특정 회원의 게시글 목록 조회 */
    fetchUserBoards: async (memberId) => {
        try {
            const data = await getBoardsByMember(memberId);
            set({ boardList: data.length ? data : [defaultBoard] }); // ✅ 값이 비어있으면 기본 데이터 반환
        } catch (error) {
            console.error('❌ 특정 회원의 게시글 목록 불러오기 실패:', error);
            set({ boardList: [defaultBoard] }); // ❌ 오류 발생 시 기본 데이터 반환
        }
    },
}));

export default boardStore;
