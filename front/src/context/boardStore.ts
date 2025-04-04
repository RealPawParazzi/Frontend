import { create } from 'zustand';
import {
    createBoard,
    getBoardList,
    getBoardDetail,
    updateBoard,
    deleteBoard,
    getBoardsByMember,
    toggleLike,
    fetchLikes,
} from '../services/boardService';

/** 📌 게시글 데이터 타입 정의 */
export interface Board {
    id: number;
    title: string;
    visibility: 'PUBLIC' | 'FOLLOWERS';
    titleImage: string;
    titleContent: string;
    writeDatetime: string;
    favoriteCount: number;
    liked: boolean;
    commentCount: number;
    viewCount: number;
    author: {
        id: number;
        nickname: string;
        profileImageUrl: string;
    };
    contents?: { type: 'text' | 'image' | 'File'; value: string; thumbnail?: string }[];
}


// API 응답 타입 정의
interface LikeToggleResponse {
    memberId: number;
    boardId: number;
    liked: boolean;
    favoriteCount: number;
}

interface LikedMember {
    memberId: number;
    nickname: string;
    profileImageUrl: string;
}

interface LikeResponse {
    boardId: number;
    likesCount: number;
    likedMember: LikedMember[];
}

/** ✅ 기본 더미 데이터 (게시글이 없을 때만 표시) */
const defaultBoard: Board = {
    id: 0,
    title: '게시글이 없습니다.',
    visibility: 'PUBLIC',
    titleImage: require('../assets/images/post-2.jpg'), // 기본 이미지
    titleContent: '현재 작성된 게시글이 없습니다.',
    writeDatetime: new Date().toISOString(),
    favoriteCount: 0,
    liked: false, // ✅ 기본 좋아요 상태 추가
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
    boardList: Board[];
    selectedBoard: Board | null;
    fetchBoardList: () => Promise<void>;
    fetchBoardDetail: (boardId: number) => Promise<void>;
    createNewBoard: (
        userData: any,
        mediaFiles: File[],
        titleImage?: File | null,
        titleContent?: string
    ) => Promise<void>;
    updateExistingBoard: (
        boardId: number,
        userData: any,
        mediaFiles: File[],
        titleImage?: File | null,
        titleContent?: string
    ) => Promise<void>;
    deleteExistingBoard: (boardId: number) => Promise<void>;
    fetchUserBoards: (memberId: number) => Promise<void>;
    toggleBoardLike: (boardId: number) => Promise<LikeToggleResponse | undefined>;
    fetchBoardLikes: (boardId: number) => Promise<LikeResponse | undefined>;
}>((set) => ({
    /** ✅ 게시글 목록 (기본값: dummy 데이터) */
    boardList: [defaultBoard],


    /** ✅ 선택된 게시글 */
    selectedBoard: defaultBoard,

    /** 🔵 전체 게시글 목록 가져오기 */
    fetchBoardList: async () => {
        try {
            const data = await getBoardList();
            set({ boardList: data });
        } catch (error) {
            console.error('❌ 전체 게시글 불러오기 실패:', error);
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

    /** 🟢 게시글 등록 요청 */
    createNewBoard: async (userData, _mediaFiles, titleImage, titleContent) => {
        try {
            const textContents = userData.contents.filter((c: any) => c.type === 'text' && c.value.trim() !== '');
            const mediaBlocks = userData.contents.filter((c: any) => c.type === 'File');

            const mediaFiles = mediaBlocks.map(({ value }: any) => ({
                uri: value,
                name: value.split('/').pop() || `media_${Date.now()}`,
                type: value.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
            }));

            const fallbackTitleImage = titleImage || mediaFiles?.[0] || null;
            const fallbackTitleContent = titleContent || textContents.find((c: any) => c.value.trim())?.value || '내용 없음';

            const newBoard = await createBoard(
                { ...userData, contents: textContents },
                mediaFiles,
                fallbackTitleImage,
                fallbackTitleContent
            );

            set((state) => ({
                boardList: [newBoard, ...state.boardList.filter((b) => b.id !== 0)],
            }));
        } catch (error) {
            console.error('❌ 게시글 등록 실패:', error);
        }
    },

    /** 🟡 게시글 수정 요청 */
    updateExistingBoard: async (boardId, userData, _mediaFiles, titleImage, titleContent) => {
        try {
            const textContents = userData.contents.filter((c: any) => c.type === 'text' && c.value.trim() !== '');
            const mediaBlocks = userData.contents.filter((c: any) => c.type === 'File');

            const mediaFiles = mediaBlocks.map(({ value }: any) => ({
                uri: value,
                name: value.split('/').pop() || `media_${Date.now()}`,
                type: value.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
            }));

            const fallbackTitleImage = titleImage || mediaFiles?.[0] || null;
            const fallbackTitleContent = titleContent || textContents.find((c: any) => c.value.trim())?.value || '내용 없음';

            const updatedBoard = await updateBoard(
                boardId,
                { ...userData, contents: textContents },
                mediaFiles,
                fallbackTitleImage,
                fallbackTitleContent
            );

            set((state) => ({
                boardList: state.boardList.map((b) => (b.id === boardId ? updatedBoard : b)),
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
                set({ boardList: data.length > 0 ? data : [defaultBoard] });
            } else {
                console.warn('⚠️ 게시글이 없어서 기본 데이터 설정됨.');
                set({ boardList: [defaultBoard] }); // ✅ 게시글이 없을 경우 기본 데이터 설정
            }

        } catch (error) {
            console.error('❌ 특정 회원의 게시글 목록 불러오기 실패:', error);
            set({ boardList: [defaultBoard] }); // ❌ 오류 발생 시 기본 데이터 반환
        }
    },

    /** ✅ 좋아요 토글 (등록/취소) */
    toggleBoardLike: async (boardId) => {
        try {
            // API 호출 - 토큰에서 memberId 사용
            const result = await toggleLike(boardId);

            // 좋아요 상태 업데이트
            set((state) => ({
                boardList: state.boardList.map((board) =>
                    board.id === result.boardId
                        ? {
                            ...board,
                            liked: result.liked,
                            favoriteCount: result.favoriteCount,
                        }
                        : board
                ),
                selectedBoard:
                    state.selectedBoard && state.selectedBoard.id === result.boardId
                        ? {
                            ...state.selectedBoard,
                            liked: result.liked,
                            favoriteCount: result.favoriteCount,
                        }
                        : state.selectedBoard,
            }));


            console.log(`🟢 memberId: ${result.memberId}가 boardId: ${result.boardId}에 좋아요 ${result.liked ? '추가' : '취소'}됨. (총 ${result.favoriteCount}개)`);

            return result;
        } catch (error) {
            console.error('❌ toggleBoardLike 오류:', error);
            return undefined;
        }
    },

    /** ✅ 특정 게시글의 좋아요 누른 회원 목록 조회 */
    fetchBoardLikes: async (boardId) => {
        try {
            const data = await fetchLikes(boardId);

            // 좋아요 목록 정보 업데이트
            set((state) => ({
                selectedBoard: state.selectedBoard && state.selectedBoard.id === boardId
                    ? {
                        ...state.selectedBoard,
                        favoriteCount: data.likesCount,
                    }
                    : state.selectedBoard,
            }));

            return data;
        } catch (error) {
            console.error('❌ fetchBoardLikes 오류:', error);
            return undefined;
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
