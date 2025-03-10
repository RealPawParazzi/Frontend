import { create } from 'zustand';
import {
    createReply, updateReply, deleteReply, getRepliesByComment,
    toggleReplyLike, fetchReplyLikes,
} from '../services/replyService';

/** 📌 대댓글 타입 */
interface Reply {
    replyId: number;
    content: string;
    likeCount: number;
    createdAt: string;
    updatedAt: string;
    replyMember: {
        memberId: number;
        nickname: string;
        profileImageUrl: string | null;
    };
    likedMembers?: { memberId: number; nickname: string; profileImageUrl: string | null }[];
    liked?: boolean; // 현재 사용자가 좋아요를 눌렀는지 여부
}

/** 📌 Zustand 대댓글 Store */
interface ReplyStore {
    replies: { [key: number]: Reply[] }; // 댓글 ID별 대댓글 리스트 저장
    fetchRepliesByComment: (commentId: number) => Promise<void>;
    addReply: (commentId: number, content: string) => Promise<void>;
    editReply: (replyId: number, content: string) => Promise<void>;
    removeReply: (replyId: number) => Promise<void>;
    isReplyLikedByMe: { [key: number]: boolean }; // 댓글 ID별 현재 사용자의 좋아요 상태
    toggleLikeOnReply: (replyId: number, commentId: number) => Promise<void>;
    fetchReplyLikeDetails: (replyId: number, commentId: number) => Promise<void>;
}
/** ✅ Zustand 대댓글 상태 */
const replyStore = create<ReplyStore>((set) => ({
    replies: {},
    isReplyLikedByMe: {},

    /**
     * ✅ 특정 댓글의 대댓글 목록 가져오기
     */
    fetchRepliesByComment: async (commentId) => {
        try {
            const response = await getRepliesByComment(commentId);
            set((state) => ({
                replies: { ...state.replies, [commentId]: response.replies },
            }));
        } catch (error) {
            console.error('❌ [대댓글 목록 가져오기 실패]:', error);
        }
    },

    /**
     * ✅ 대댓글 추가
     */
    addReply: async (commentId, content) => {
        try {
            const newReply = await createReply(commentId, content);
            set((state) => ({
                replies: {
                    ...state.replies,
                    [commentId]: [...(state.replies[commentId] || []), newReply],
                },
            }));
        } catch (error) {
            console.error('❌ [대댓글 추가 실패]:', error);
        }
    },

    /**
     * ✅ 대댓글 수정
     */
    editReply: async (replyId, content) => {
        try {
            const updatedReply = await updateReply(replyId, content);
            set((state) => {
                const updatedReplies = { ...state.replies };
                Object.keys(updatedReplies).forEach((commentId) => {
                    updatedReplies[Number(commentId)] = updatedReplies[Number(commentId)].map((r) =>
                        r.replyId === replyId ? updatedReply : r
                    );
                });
                return { replies: updatedReplies };
            });
        } catch (error) {
            console.error('❌ [대댓글 수정 실패]:', error);
        }
    },

    /**
     * ✅ 대댓글 삭제
     */
    removeReply: async (replyId) => {
        try {
            await deleteReply(replyId);
            set((state) => {
                const updatedReplies = { ...state.replies };
                Object.keys(updatedReplies).forEach((commentId) => {
                    updatedReplies[Number(commentId)] = updatedReplies[Number(commentId)].filter((r) => r.replyId !== replyId);
                });
                return { replies: updatedReplies };
            });
        } catch (error) {
            console.error('❌ [대댓글 삭제 실패]:', error);
        }
    },

    /**
     * ✅ 대댓글 좋아요 토글 (등록/취소)
     */
    toggleLikeOnReply: async (replyId, commentId) => {
        try {
            const result = await toggleReplyLike(replyId);
            set((state) => {
                const updatedReplies = { ...state.replies };
                const updatedIsLikedByMe = { ...state.isReplyLikedByMe };

                // 해당 대댓글의 좋아요 상태 업데이트
                updatedIsLikedByMe[replyId] = result.liked;

                if (updatedReplies[commentId]) {
                    updatedReplies[commentId] = updatedReplies[commentId].map((r) =>
                        r.replyId === replyId ? {
                            ...r,
                            likeCount: result.replyLikeCount,
                            liked: result.liked,
                        } : r
                    );
                }
                return {
                    replies: updatedReplies,
                    isReplyLikedByMe: updatedIsLikedByMe,
                };
            });
            return result;
        } catch (error) {
            console.error('❌ [대댓글 좋아요 토글 실패]:', error);
        }
    },

    /**
     * ✅ 특정 대댓글의 좋아요 목록 가져오기
     */
    fetchReplyLikeDetails: async (replyId, commentId) => {
        try {
            const data = await fetchReplyLikes(replyId);
            set((state) => {
                const updatedReplies = { ...state.replies };
                if (updatedReplies[commentId]) {
                    updatedReplies[commentId] = updatedReplies[commentId].map((r) =>
                        r.replyId === replyId ? {
                            ...r,
                            likedMembers: data.likedMembers,
                            likeCount: data.totalLikes,
                        } : r
                    );
                }
                return { replies: updatedReplies };
            });
            return data;
        } catch (error) {
            console.error('❌ [대댓글 좋아요 목록 불러오기 실패]:', error);
        }
    },
}));

export default replyStore;
