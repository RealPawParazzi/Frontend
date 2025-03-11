import { create } from 'zustand';
import {
    createComment, updateComment,
    deleteComment, getCommentsByBoard,
    toggleCommentLike, fetchCommentLikes,
} from '../services/commentService';

/** 📌 댓글 타입 */
interface Comment {
    commentId: number;
    content: string;
    commentLiked: boolean; // ✅ 좋아요 상태 추가
    commentsLikeCount: number;
    replyCount: number;
    createdAt: string;
    updatedAt: string;
    commentMember: {
        memberId: number;
        nickname: string;
        profileImageUrl: string | null;
    };
    likedMembers?: { memberId: number; nickname: string; profileImageUrl: string | null }[];
}

/** 📌 Zustand 댓글 Store */
interface CommentStore {
    comments: { [key: number]: Comment[] }; // 게시글 ID별 댓글 리스트 저장
    fetchCommentsByBoard: (boardId: number) => Promise<void>;
    addComment: (boardId: number, content: string) => Promise<void>;
    editComment: (commentId: number, content: string) => Promise<void>;
    removeComment: (commentId: number) => Promise<void>;
    toggleLikeOnComment: (commentId: number, boardId: number) => Promise<CommentLikeToggleResponse | undefined>;
    fetchCommentLikeDetails: (commentId: number, boardId: number) => Promise<CommentLikeResponse | undefined>;
}

// ✅ 댓글 좋아요 토글 응답 타입
interface CommentLikeToggleResponse {
    memberId: number;      // 좋아요를 누른 사용자 ID
    commentId: number;     // 좋아요가 적용된 댓글 ID
    liked: boolean;        // 좋아요 상태 (true: 좋아요 등록, false: 좋아요 취소)
    commentsLikeCount: number;     // 업데이트된 좋아요 수
}

// ✅ 댓글 좋아요 누른 회원 목록 응답 타입
interface CommentLikedMember {
    memberId: number;
    nickname: string;
    profileImageUrl: string | null;
}

// ✅ 특정 댓글의 좋아요 정보 응답 타입
interface CommentLikeResponse {
    commentId: number;
    likeCount: number;              // 총 좋아요 수
    likedMembers: CommentLikedMember[]; // 좋아요 누른 사용자 목록
}


/** ✅ Zustand 댓글 상태 */
const commentStore = create<CommentStore>((set) => ({
    comments: {},

    /**
     * ✅ 특정 게시글의 댓글 목록 가져오기
     */
    fetchCommentsByBoard: async (boardId) => {
        try {
            const response = await getCommentsByBoard(boardId);
            set((state) => ({
                comments: {
                    ...state.comments,
                    [boardId]: response.comments.map((c: { commentsLikeCount: any; }) => ({
                        ...c,
                        commentsLikeCount: c.commentsLikeCount ?? 0, // ✅ undefined 방지
                    })),
                },
            }));
        } catch (error) {
            console.error('❌ [댓글 목록 가져오기 실패]:', error);
        }
    },

    /**
     * ✅ 댓글 추가
     */
    addComment: async (boardId, content) => {
        try {
            const newComment = await createComment(boardId, content);
            set((state) => ({
                comments: {
                    ...state.comments,
                    [boardId]: state.comments[boardId]
                        ? [...state.comments[boardId], newComment]
                        : [newComment],
                },
            }));
        } catch (error) {
            console.error('❌ [댓글 추가 실패]:', error);
        }
    },

    /**
     * ✅ 댓글 수정
     */
    editComment: async (commentId, content) => {
        try {
            const updatedComment = await updateComment(commentId, content);
            set((state) => {
                const updatedComments = { ...state.comments };
                Object.keys(updatedComments).forEach((boardId) => {
                    updatedComments[Number(boardId)] = updatedComments[Number(boardId)].map((c) =>
                        c.commentId === commentId ? updatedComment : c
                    );
                });
                return { comments: updatedComments };
            });
        } catch (error) {
            console.error('❌ [댓글 수정 실패]:', error);
        }
    },

    /**
     * ✅ 댓글 삭제
     */
    removeComment: async (commentId) => {
        try {
            await deleteComment(commentId);
            set((state) => {
                const updatedComments = { ...state.comments };
                Object.keys(updatedComments).forEach((boardId) => {
                    updatedComments[Number(boardId)] = updatedComments[Number(boardId)].filter((c) => c.commentId !== commentId);
                });
                return { comments: updatedComments };
            });
        } catch (error) {
            console.error('❌ [댓글 삭제 실패]:', error);
        }
    },

    /**
     * ✅ 댓글 좋아요 토글 (등록/취소)
     */
    toggleLikeOnComment: async (commentId, boardId) => {
        try {
            // API 호출
            const result: CommentLikeToggleResponse = await toggleCommentLike(commentId);
            console.log('🔥 좋아요 API 응답:', result);

            // 좋아요 상태 업데이트
            set((state) => ({
                comments: {
                    ...state.comments,
                    [boardId]: state.comments[boardId]?.map((c) =>
                        c.commentId === result.commentId
                            ? {
                                ...c,
                                commentLiked: result.liked, // ✅ 좋아요 상태 업데이트
                                commentsLikeCount: result.commentsLikeCount, // ✅ 기존 값 유지
                            }
                            : c
                    ),
                },
            }));

            console.log(
                `🟢 memberId: ${result.memberId}가 commentId: ${result.commentId}에 좋아요 ${result.liked ? '추가' : '취소'}됨. (총 ${result.commentsLikeCount}개)`
            );

            return result;
        } catch (error) {
            console.error('❌ toggleLikeOnComment 오류:', error);
            return undefined;
        }
    },

    /**
     * ✅ 특정 댓글의 좋아요 목록 가져오기
     */
    fetchCommentLikeDetails: async (commentId, boardId) => {
        try {
            const data: CommentLikeResponse = await fetchCommentLikes(commentId);

            // 좋아요 목록 업데이트
            set((state) => ({
                comments: {
                    ...state.comments,
                    [boardId]: state.comments[boardId]?.map((c) =>
                        c.commentId === data.commentId
                            ? {
                                ...c,
                                likedMembers: data.likedMembers, // ✅ 좋아요한 사용자 목록 업데이트
                                commentsLikeCount: data.likeCount, // ✅ 좋아요 개수 업데이트
                            }
                            : c
                    ),
                },
            }));

            return data;
        } catch (error) {
            console.error('❌ fetchCommentLikeDetails 오류:', error);
            return undefined;
        }
    },
}));

export default commentStore;
