import { create } from 'zustand';
import { followUser, unfollowUser, getFollowers, getFollowing } from '../services/followService';

/** 📌 팔로워 & 팔로잉 타입 */
export interface Follower {
    followerNickName: string;
    followerName: string | null;
    followerProfileImageUrl: string | null;
}

export interface Following {
    followingNickName: string;
    followingName: string | null;
    followingProfileImageUrl: string | null;
}

/** 📌 Zustand 팔로우 Store */
interface FollowStore {
    followers: Follower[];
    following: Following[];
    fetchFollowers: (targetId: number) => Promise<void>;
    fetchFollowing: (targetId: number) => Promise<void>;
    followUser: (targetId: number) => Promise<void>;
    unfollowUser: (targetId: number) => Promise<void>;
}

/** ✅ Zustand 팔로우 상태 */
const followStore = create<FollowStore>((set) => ({
    followers: [],
    following: [],

    /** ✅ 팔로워 목록 가져오기 */
    fetchFollowers: async (targetId) => {
        try {
            console.log(`📥 [팔로워 목록 요청] -> ${targetId}`);
            const followers = await getFollowers(targetId);
            set({ followers: followers.length > 0 ? followers : [] });
        } catch (error) {
            console.error('❌ [팔로워 목록 가져오기 실패]:', error);
            set({ followers: [] }); // 오류 발생 시 기본값 유지
        }
    },

    /** ✅ 팔로잉 목록 가져오기 */
    fetchFollowing: async (targetId) => {
        try {
            console.log(`📥 [팔로잉 목록 요청] -> ${targetId}`);
            const following = await getFollowing(targetId);
            set({ following: following.length > 0 ? following : [] });
        } catch (error) {
            console.error('❌ [팔로잉 목록 가져오기 실패]:', error);
            set({ following: [] }); // 오류 발생 시 기본값 유지
        }
    },

    /** ✅ 유저 팔로우 후 상태 업데이트 */
    followUser: async (targetId) => {
        try {
            console.log(`📤 [팔로우 요청] -> ${targetId}`);
            const response = await followUser(targetId);
            if (response) {
                set((state) => ({
                    following: [...state.following, {
                        followingNickName: response.followingNickName,
                        followingName: response.followingName,
                        followingProfileImageUrl: response.followingProfileImageUrl
                    }],
                }));
            }
        } catch (error) {
            console.error('❌ [팔로우 요청 실패]:', error);
        }
    },

    /** ✅ 유저 언팔로우 후 상태 업데이트 */
    unfollowUser: async (targetId) => {
        try {
            console.log(`📤 [언팔로우 요청] -> ${targetId}`);
            await unfollowUser(targetId);
            set((state) => ({
                following: state.following.filter(user => user.followingNickName !== targetId.toString()),
            }));
        } catch (error) {
            console.error('❌ [언팔로우 요청 실패]:', error);
        }
    },
}));

export default followStore;
