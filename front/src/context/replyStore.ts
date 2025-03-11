import { create } from 'zustand';
import {
    createReply, updateReply, deleteReply, getRepliesByComment,
    toggleReplyLike, fetchReplyLikes,
} from '../services/replyService';

/** 📌 대댓글 타입 */
interface Reply {
    replyId: number;
    content: string;
    replyLiked: boolean; // ✅ 좋아요 상태 추가
    replyLikeCount: number;
    createdAt: string;
    updatedAt: string;
    replyMember: {
        memberId: number;
        nickname: string;
        profileImageUrl: string | null;
    };
    likedMembers?: { memberId: number; nickname: string; profileImageUrl: string | null }[];
}

/** 📌 Zustand 대댓글 Store */
interface ReplyStore {
    replies: { [key: number]: Reply[] }; // 댓글 ID별 대댓글 리스트 저장
    fetchRepliesByComment: (commentId: number) => Promise<void>;
    addReply: (commentId: number, content: string) => Promise<void>;
    editReply: (replyId: number, content: string) => Promise<void>;
    removeReply: (replyId: number) => Promise<void>;
    toggleLikeOnReply: (replyId: number, commentId: number) => Promise<ReplyLikeToggleResponse | undefined>;
    fetchReplyLikeDetails: (replyId: number, commentId: number) => Promise<ReplyLikeResponse | undefined>;
}

// ✅ 대댓글 좋아요 토글 응답 타입
interface ReplyLikeToggleResponse {
    memberId: number;      // 좋아요를 누른 사용자 ID
    replyId: number;     // 좋아요가 적용된 대댓글 ID
    liked: boolean;        // 좋아요 상태 (true: 좋아요 등록, false: 좋아요 취소)
    replyLikeCount: number;     // 업데이트된 좋아요 수
}

// ✅ 대댓글 좋아요 누른 회원 목록 응답 타입
interface ReplyLikedMember {
    memberId: number;
    nickname: string;
    profileImageUrl: string | null;
}

// ✅ 특정 대댓글의 좋아요 정보 응답 타입
interface ReplyLikeResponse {
    replyId: number;
    likeCount: number;              // 총 좋아요 수
    likedMembers: ReplyLikedMember[]; // 좋아요 누른 사용자 목록
}

/** ✅ Zustand 대댓글 상태 */
const replyStore = create<ReplyStore>((set) => ({
    replies: {},

    /**
     * ✅ 특정 댓글의 대댓글 목록 가져오기
     */
    fetchRepliesByComment: async (commentId) => {
        try {
            const response = await getRepliesByComment(commentId);
            set((state) => ({
                replies: {
                    ...state.replies,
                    [commentId]: response.replies.map((r: { replyLikeCount: any; }) => ({
                        ...r,
                        replyLikeCount: r.replyLikeCount ?? 0, // ✅ undefined 방지
                    })),
                },
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
            const result : ReplyLikeToggleResponse = await toggleReplyLike(replyId);
            console.log('🔥 대댓글 좋아요 API 응답:', result);
            // 좋아요 상태 업데이트
            set((state) => ({
                replies: {
                    ...state.replies,
                    [commentId]: state.replies[commentId]?.map((r) =>
                        r.replyId === result.replyId
                            ? {
                                ...r,
                                replyLiked: result.liked, // ✅ 좋아요 상태 업데이트
                                replyLikeCount: result.replyLikeCount, // ✅ 기존 값 유지
                            }
                            : r
                    ),
                },
            }));

            console.log(
                `🟢 memberId: ${result.memberId}가 commentId: ${result.replyId}에 좋아요 ${result.liked ? '추가' : '취소'}됨. (총 ${result.replyLikeCount}개)`
            );

            return result;
        } catch (error) {
            console.error('❌ toggleLikeOnComment 오류:', error);
            return undefined;
        }
    },


    /**
     * ✅ 특정 대댓글의 좋아요 목록 가져오기
     */
    fetchReplyLikeDetails: async (replyId, commentId) => {
        try {
            const data = await fetchReplyLikes(replyId);

            // 좋아요 목록 업데이트
            set((state) => ({
                replies: {
                    ...state.replies,
                    [commentId]: state.replies[commentId]?.map((r) =>
                        r.replyId === data.replyId
                            ? {
                                ...r,
                                likedMembers: data.likedMembers, // ✅ 좋아요한 사용자 목록 업데이트
                                replyLikeCount: data.likeCount, // ✅ 좋아요 개수 업데이트
                            }
                            : r
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

export default replyStore;
