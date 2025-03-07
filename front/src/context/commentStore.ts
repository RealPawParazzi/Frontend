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
    likeCount: number;
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
    toggleLikeOnComment: (commentId: number, boardId: number) => Promise<void>;
    fetchCommentLikeDetails: (commentId: number, boardId: number) => Promise<void>;
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
                comments: { ...state.comments, [boardId]: response.comments },
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
                    [boardId]: [...(state.comments[boardId] || []), newComment],
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
            const result = await toggleCommentLike(commentId);
            set((state) => {
                const updatedComments = { ...state.comments };
                if (updatedComments[boardId]) {
                    updatedComments[boardId] = updatedComments[boardId].map((c) =>
                        c.commentId === commentId ? { ...c, likeCount: result.commentsLikeCount } : c
                    );
                }
                return { comments: updatedComments };
            });
        } catch (error) {
            console.error('❌ [댓글 좋아요 토글 실패]:', error);
        }
    },

    /**
     * ✅ 특정 댓글의 좋아요 목록 가져오기
     */
    fetchCommentLikeDetails: async (commentId, boardId) => {
        try {
            const data = await fetchCommentLikes(commentId);
            set((state) => {
                const updatedComments = { ...state.comments };
                if (updatedComments[boardId]) {
                    updatedComments[boardId] = updatedComments[boardId].map((c) =>
                        c.commentId === commentId ? { ...c, likedMembers: data.likedMembers, likeCount: data.likeCount } : c
                    );
                }
                return { comments: updatedComments };
            });
        } catch (error) {
            console.error('❌ [댓글 좋아요 목록 불러오기 실패]:', error);
        }
    },
}));

export default commentStore;
