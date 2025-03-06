import { create } from 'zustand';
import {
    toggleBoardLike, getBoardLikes,
    toggleCommentLike, getCommentLikes,
    toggleReplyLike, getReplyLikes,
} from '../services/likeService';

/** 📌 좋아요한 유저 타입 */
interface LikedMember {
    memberId: number;
    nickname: string;
    profileImageUrl: string | null;
}

/** 📌 Zustand 좋아요 Store */
interface LikeStore {
    boardLikes: { [key: number]: LikedMember[] };
    commentLikes: { [key: number]: LikedMember[] };
    replyLikes: { [key: number]: LikedMember[] };
    toggleBoardLike: (boardId: number) => Promise<void>;
    toggleCommentLike: (commentId: number) => Promise<void>;
    toggleReplyLike: (replyId: number) => Promise<void>;
    fetchBoardLikes: (boardId: number) => Promise<void>;
    fetchCommentLikes: (commentId: number) => Promise<void>;
    fetchReplyLikes: (replyId: number) => Promise<void>;
}

/** ✅ Zustand 좋아요 상태 */
const likeStore = create<LikeStore>((set) => ({
    boardLikes: {},
    commentLikes: {},
    replyLikes: {},

    /**
     * ✅ 게시글 좋아요 토글
     */
    toggleBoardLike: async (boardId) => {
        try {
            const response = await toggleBoardLike(boardId);
            console.log(`📌 [게시글 ${boardId} 좋아요 상태 변경]:`, response);
            await likeStore.getState().fetchBoardLikes(boardId); // ✅ 최신 데이터 반영
        } catch (error) {
            console.error('❌ [게시글 좋아요 실패]:', error);
        }
    },

    /**
     * ✅ 댓글 좋아요 토글
     */
    toggleCommentLike: async (commentId) => {
        try {
            const response = await toggleCommentLike(commentId);
            console.log(`📌 [댓글 ${commentId} 좋아요 상태 변경]:`, response);
            await likeStore.getState().fetchCommentLikes(commentId);
        } catch (error) {
            console.error('❌ [댓글 좋아요 실패]:', error);
        }
    },

    /**
     * ✅ 대댓글 좋아요 토글
     */
    toggleReplyLike: async (replyId) => {
        try {
            const response = await toggleReplyLike(replyId);
            console.log(`📌 [대댓글 ${replyId} 좋아요 상태 변경]:`, response);
            await likeStore.getState().fetchReplyLikes(replyId);
        } catch (error) {
            console.error('❌ [대댓글 좋아요 실패]:', error);
        }
    },

    /**
     * ✅ 특정 게시글의 좋아요 목록 가져오기
     */
    fetchBoardLikes: async (boardId) => {
        try {
            const response = await getBoardLikes(boardId);
            set((state) => ({
                boardLikes: { ...state.boardLikes, [boardId]: response.likedMember },
            }));
        } catch (error) {
            console.error('❌ [게시글 좋아요 목록 가져오기 실패]:', error);
        }
    },

    /**
     * ✅ 특정 댓글의 좋아요 목록 가져오기
     */
    fetchCommentLikes: async (commentId) => {
        try {
            const response = await getCommentLikes(commentId);
            set((state) => ({
                commentLikes: { ...state.commentLikes, [commentId]: response.likedMembers },
            }));
        } catch (error) {
            console.error('❌ [댓글 좋아요 목록 가져오기 실패]:', error);
        }
    },

    /**
     * ✅ 특정 대댓글의 좋아요 목록 가져오기
     */
    fetchReplyLikes: async (replyId) => {
        try {
            const response = await getReplyLikes(replyId);
            set((state) => ({
                replyLikes: { ...state.replyLikes, [replyId]: response.likedMembers },
            }));
        } catch (error) {
            console.error('❌ [대댓글 좋아요 목록 가져오기 실패]:', error);
        }
    },
}));

export default likeStore;
