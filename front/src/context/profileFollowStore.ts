// profileFollowStore.ts - 프로필 대상 유저(B)의 팔로워, 팔로잉 관리 스토어
import { create } from 'zustand';
import { getFollowers, getFollowing } from '../services/followService';

/**
 * 📌 팔로워 인터페이스 - "특정 유저(B)"를 팔로우하는 유저(A) 리스트
 * @property {number} followerId - 팔로우한 사용자(A)의 고유 ID
 * @property {string} followerNickName - 팔로우한 사용자(A)의 닉네임
 * @property {string|null} followerName - 팔로우한 사용자(A)의 이름 (선택 필드)
 * @property {string|null} followerProfileImageUrl - 팔로우한 사용자(A)의 프로필 이미지 URL (선택 필드)
 */
export interface Follower {
    followerId: number;
    followerNickName: string;
    followerName: string | null;
    followerProfileImageUrl: string | null;
}

/**
 * 📌 팔로잉 인터페이스 - 특정 유저(B)가 팔로우하는 유저(C) 리스트
 * @property {number} followingId - B가 팔로우한 대상(C)의 고유 ID
 * @property {string} followingNickName - B가 팔로우한 대상(C)의 닉네임
 * @property {string|null} followingName - B가 팔로우한 대상(C)의 이름 (선택 필드)
 * @property {string|null} followingProfileImageUrl - B가 팔로우한 대상(C)의 프로필 이미지 URL (선택 필드)
 */
export interface Following {
    followingId: number;
    followingNickName: string;
    followingName: string | null;
    followingProfileImageUrl: string | null;
}

/**
 * 📌 Zustand 스토어 인터페이스 정의
 * 이 스토어는 프로필 주인의 팔로워와 팔로잉 정보만 관리합니다.
 */
interface ProfileFollowStore {
    followers: Follower[];        // 🔹 프로필 유저(B)를 팔로우하는 사용자 목록
    following: Following[];       // 🔹 프로필 유저(B)가 팔로우하는 사용자 목록
    followerCount: number;        // 🔹 프로필 유저(B)의 팔로워 수
    followingCount: number;       // 🔹 프로필 유저(B)의 팔로잉 수

    /** 🔹 프로필 유저(B)를 팔로우한 사람 목록 가져오기 */
    fetchProfileFollowers: (targetId: number) => Promise<void>;

    /** 🔹 프로필 유저(B)가 팔로우한 사람 목록 가져오기 */
    fetchProfileFollowing: (targetId: number) => Promise<void>;

    /** 🔹 프로필 유저(B)의 팔로워 수 직접 업데이트 (즉각 반영) */
    setFollowerCount: (count: number) => void;

    /** 🔹 프로필 유저(B)의 팔로잉 수 직접 업데이트 (즉각 반영) */
    setFollowingCount: (count: number) => void;
}

/**
 * ✅ Zustand 스토어 생성 - 프로필 유저의 팔로워/팔로잉 상태 관리
 */
const profileFollowStore = create<ProfileFollowStore>((set) => ({
    followers: [],
    following: [],
    followerCount: 0,
    followingCount: 0,

    /**
     * ✅ 프로필 유저(B)의 팔로워 목록 가져오기
     * @param {number} targetId - 프로필 대상 유저의 ID
     */
    fetchProfileFollowers: async (targetId) => {
        try {
            const followers = await getFollowers(targetId);
            set({
                followers,
                followerCount: followers.length || 0, // 🔸 팔로워 수 자동 반영
            });
        } catch (error) {
            console.error('❌ 팔로워 목록 가져오기 실패:', error);
            set({ followers: [], followerCount: 0 }); // 오류 시 빈 상태로 초기화
        }
    },

    /**
     * ✅ 프로필 유저(B)의 팔로잉 목록 가져오기
     * @param {number} targetId - 프로필 대상 유저의 ID
     */
    fetchProfileFollowing: async (targetId) => {
        try {
            const following = await getFollowing(targetId);
            set({
                following,
                followingCount: following.length || 0, // 🔸 팔로잉 수 자동 반영
            });
        } catch (error) {
            console.error('❌ 팔로잉 목록 가져오기 실패:', error);
            set({ following: [], followingCount: 0 }); // 오류 시 빈 상태로 초기화
        }
    },

    /**
     * ✅ 프로필 유저(B)의 팔로워 수 직접 설정
     * @param {number} count - 새 팔로워 수
     */
    setFollowerCount: (count) => set({ followerCount: count }),

    /**
     * ✅ 프로필 유저(B)의 팔로잉 수 직접 설정
     * @param {number} count - 새 팔로잉 수
     */
    setFollowingCount: (count) => set({ followingCount: count }),
}));

export default profileFollowStore;
