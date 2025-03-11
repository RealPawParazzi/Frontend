// followStore.ts - 팔로우 관련 상태 관리 스토어
import { create } from 'zustand';
import { followUser, unfollowUser, getFollowers, getFollowing } from '../services/followService';

/**
 * 📌 팔로워 인터페이스 - 나를 팔로우하는 사용자 정보 타입 정의
 * @property {number} followerId - 팔로워 사용자의 고유 ID
 * @property {string} followerNickName - 팔로워 사용자의 닉네임
 * @property {string|null} followerName - 팔로워 사용자의 이름 (선택 필드)
 * @property {string|null} followerProfileImageUrl - 팔로워 프로필 이미지 URL (선택 필드)
 */
export interface Follower {
    followerId: number; // ✅ ID를 기본 식별자로 사용
    followerNickName: string;
    followerName: string | null;
    followerProfileImageUrl: string | null;
}

/**
 * 📌 팔로잉 인터페이스 - 내가 팔로우하는 사용자 정보 타입 정의
 * @property {number} followingId - 팔로잉 사용자의 고유 ID
 * @property {string} followingNickName - 팔로잉 사용자의 닉네임
 * @property {string|null} followingName - 팔로잉 사용자의 이름 (선택 필드)
 * @property {string|null} followingProfileImageUrl - 팔로잉 프로필 이미지 URL (선택 필드)
 */
export interface Following {
    followingId: number; // ✅ ID를 기본 식별자로 사용
    followingNickName: string;
    followingName: string | null;
    followingProfileImageUrl: string | null;
}

/**
 * 📌 Zustand 팔로우 스토어 인터페이스 정의
 * @property {Follower[]} followers - 팔로워 목록 상태
 * @property {Following[]} following - 팔로잉 목록 상태
 * @property {Function} fetchFollowers - 팔로워 목록 조회 액션
 * @property {Function} fetchFollowing - 팔로잉 목록 조회 액션
 * @property {Function} followUser - 사용자 팔로우 액션
 * @property {Function} unfollowUser - 사용자 언팔로우 액션
 */
interface FollowStore {
    followers: Follower[];
    following: Following[];
    fetchFollowers: (targetId: number) => Promise<void>; // ✅ targetId를 팔로우하는 사람 목록 가져오기
    fetchFollowing: (targetId: number) => Promise<void>; // ✅ targetId가 팔로우하는 사람 목록 가져오기
    followUser: (targetId: number) => Promise<void>;
    unfollowUser: (targetId: number) => Promise<void>;
}

/**
 * ✅ Zustand 팔로우 상태 관리 스토어 생성
 * 팔로우/언팔로우 및 팔로워/팔로잉 목록 관리 기능 구현
 */
const followStore = create<FollowStore>((set) => ({
    followers: [],
    following: [],

    /**
     * ✅ targetId를 팔로우하는 사람들의 목록 가져오기
     * @param {number} targetId - 팔로워 목록을 조회할 사용자 ID
     */
    fetchFollowers: async (targetId) => {
        try {
            console.log(`📥 [팔로워 목록 요청] -> ${targetId}`);
            const followers = await getFollowers(targetId);
            set({ followers: followers.length > 0 ? followers : [] });
        } catch (error) {
            console.error('❌ [팔로워 목록 가져오기 실패]:', error);
            set({ followers: [] }); // 오류 발생 시 빈 배열로 상태 초기화
        }
    },

    /**
     * ✅ targetId가 팔로우하는 사람들의 목록 가져오기
     * @param {number} targetId - 팔로잉 목록을 조회할 사용자 ID
     */
    fetchFollowing: async (targetId) => {
        try {
            console.log(`📥 [팔로잉 목록 요청] -> ${targetId}`);
            const following = await getFollowing(targetId);
            set({ following: following.length > 0 ? following : [] });
        } catch (error) {
            console.error('❌ [팔로잉 목록 가져오기 실패]:', error);
            set({ following: [] }); // 오류 발생 시 빈 배열로 상태 초기화
        }
    },

    /**
     * ✅ targetId 사용자를 팔로우하고 상태 업데이트
     * 팔로우 요청 성공 시 following 배열에 새 항목 추가
     * @param {number} targetId - 팔로우할 사용자 ID
     */
    followUser: async (targetId) => {
        try {
            console.log(`📤 [팔로우 요청] -> ${targetId}`);
            const response = await followUser(targetId);
            if (response) {
                set((state) => ({
                    following: [
                        ...state.following,
                        {
                            followingId: targetId, // ✅ 숫자형 ID 사용
                            followingNickName: response.followingNickName,
                            followingName: response.followingName,
                            followingProfileImageUrl: response.followingProfileImageUrl,
                        },
                    ],
                }));
            }
        } catch (error) {
            console.error('❌ [팔로우 요청 실패]:', error);
        }
    },

    /**
     * ✅ targetId 사용자를 언팔로우하고 상태 업데이트
     * 언팔로우 요청 성공 시 following 배열에서 해당 항목 제거
     * @param {number} targetId - 언팔로우할 사용자 ID
     */
    unfollowUser: async (targetId) => {
        try {
            console.log(`📤 [언팔로우 요청] -> ${targetId}`);
            await unfollowUser(targetId);
            set((state) => ({
                following: state.following.filter(user => user.followingId !== targetId), // ✅ ID로 비교하여 제거
            }));
        } catch (error) {
            console.error('❌ [언팔로우 요청 실패]:', error);
        }
    },
}));

export default followStore;
