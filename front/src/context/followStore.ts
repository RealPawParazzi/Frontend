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
    fetchFollowers: (nickName: string) => Promise<void>;
    fetchFollowing: (nickName: string) => Promise<void>;
    followUser: (targetNickName: string) => Promise<void>;
    unfollowUser: (targetNickName: string) => Promise<void>;
}

/** ✅ Zustand 팔로우 상태 */
const followStore = create<FollowStore>((set) => ({
    followers: [],
    following: [],

    /**
     * ✅ 팔로워 목록 가져오기
     */
    fetchFollowers: async (nickName) => {
        try {
            console.log(`📥 [팔로워 목록 가져오기 요청] -> ${nickName}`);
            const followers = await getFollowers(nickName);
            set({ followers });
        } catch (error) {
            console.error('❌ [팔로워 목록 가져오기 실패]:', error);
        }
    },

    /**
     * ✅ 팔로잉 목록 가져오기
     */
    fetchFollowing: async (nickName) => {
        try {
            console.log(`📥 [팔로잉 목록 가져오기 요청] -> ${nickName}`);
            const following = await getFollowing(nickName);
            set({ following });
        } catch (error) {
            console.error('❌ [팔로잉 목록 가져오기 실패]:', error);
        }
    },

    /**
     * ✅ 유저 팔로우 후 상태 업데이트
     */
    followUser: async (targetNickName) => {
        try {
            console.log(`📤 [팔로우 요청] -> ${targetNickName}`);
            const response = await followUser(targetNickName);
            set((state) => ({
                following: [
                    ...state.following,
                    {
                        followingNickName: response.followingNickName,
                        followingName: response.followingNickName,
                        followingProfileImageUrl: response.followingProfileImageUrl,
                    },
                ],
            }));
        } catch (error) {
            console.error('❌ [팔로우 요청 실패]:', error);
        }
    },

    /**
     * ✅ 유저 언팔로우 후 상태 업데이트
     */
    unfollowUser: async (targetNickName) => {
        try {
            console.log(`📤 [언팔로우 요청] -> ${targetNickName}`);
            await unfollowUser(targetNickName);
            set((state) => ({
                following: state.following.filter(user => user.followingNickName !== targetNickName),
            }));
        } catch (error) {
            console.error('❌ [언팔로우 요청 실패]:', error);
        }
    },
}));

export default followStore;
