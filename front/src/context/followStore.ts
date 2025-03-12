// followStore.ts - 팔로우 관련 상태 관리 스토어
import { create } from 'zustand';
import { followUser, unfollowUser, getFollowers, getFollowing } from '../services/followService';
import userStore from './userStore';

/**
 * 📌 팔로워 인터페이스 - "특정 유저(B)"를 팔로우하는 유저(A) 리스트
 * @property {number} followerId - 팔로우한 사용자(A)의 고유 ID
 * @property {string} followerNickName - 팔로우한 사용자(A)의 닉네임
 * @property {string|null} followerName - 팔로우한 사용자(A)의 이름 (선택 필드)
 * @property {string|null} followerProfileImageUrl - 팔로우한 사용자(A)의 프로필 이미지 URL (선택 필드)
 */

// Follower: "A가 B를 팔로우하면 B의 followers 목록에 A가 추가됨"
export interface Follower {
    followerId: number;
    followerNickName: string;
    followerName: string | null;
    followerProfileImageUrl: string | null;
}

/**
 * 📌 팔로잉 인터페이스 - "특정 유저(A)"가 팔로우하는 유저(B) 리스트
 * @property {number} followingId - A가 팔로우한 대상(B)의 고유 ID
 * @property {string} followingNickName - A가 팔로우한 대상(B)의 닉네임
 * @property {string|null} followingName - A가 팔로우한 대상(B)의 이름 (선택 필드)
 * @property {string|null} followingProfileImageUrl - A가 팔로우한 대상(B)의 프로필 이미지 URL (선택 필드)
 */

// Following: "A가 B를 팔로우하면 A의 following 목록에 B가 추가됨"
export interface Following {
    followingId: number;
    followingNickName: string;
    followingName: string | null;
    followingProfileImageUrl: string | null;
}

/**
 * 📌 팔로우 응답 인터페이스 - API 응답 데이터 타입 정의
 *
 * 🔹 이 인터페이스는 특정 유저(A)가 다른 유저(B)를 팔로우하거나,
 *    A의 팔로워/팔로잉 정보를 불러올 때 사용됨.
 *
 * @property {number} followerId - **팔로우를 한 사람 (A)의 고유 ID**
 * @property {number} followingId - **팔로우를 당한 사람 (B)의 고유 ID**
 *
 * @property {string} followerNickName - **팔로우를 한 사람 (A)의 닉네임**
 * @property {string} followingNickName - **팔로우를 당한 사람 (B)의 닉네임**
 *
 * @property {string|null} followerProfileImageUrl - **팔로우를 한 사람 (A)의 프로필 이미지 URL** (없으면 null)
 * @property {string|null} followingProfileImageUrl - **팔로우를 당한 사람 (B)의 프로필 이미지 URL** (없으면 null)
 *
 *
 * A->B 팔로우 관계에서
 * - follwerCount는 B의 팔로워수, followingCount는 A의 팔로잉 수
 *
 *
 * @property {number} followerCount - **B의 팔로워 수 (B를 팔로우한 사람 수)**
 * @property {number} followingCount - **A의 팔로잉 수 (A가 팔로우하는 사람 수)**
 *
 * @property {boolean} followedStatus - **A가 B를 팔로우했는지 여부 (true = 팔로우 상태, false = 언팔로우 상태)**
 *
 * 🔹 예제 응답:
 * {
 *    followerId: 1,  // A (현재 로그인한 유저)
 *    followingId: 2,  // B (팔로우 당한 유저)
 *    followerNickName: "A 닉네임",
 *    followingNickName: "B 닉네임",
 *    followerProfileImageUrl: "A 프로필 이미지 URL",
 *    followingProfileImageUrl: "B 프로필 이미지 URL",
 *    followerCount: 10,  // B를 팔로우한 유저 수
 *    followingCount: 5,   // A가 팔로우하는 유저 수
 *    followedStatus: true // A가 B를 팔로우하고 있음
 * }
 */

export interface FollowResponse {
    followerId: number;
    followingId: number;
    followerNickName: string;
    followingNickName: string;
    followerProfileImageUrl: string | null;
    followingProfileImageUrl: string | null;
    followerCount: number;
    followingCount: number;
    followedStatus: boolean;
}

/**
 * 📌 언팔로우 응답 타입 (백엔드 `UnfollowResponseDto`와 일치)
 * @property {number} followerId - 언팔로우 한 사용자 (A)의 ID
 * @property {number} followingId - 언팔로우 당한 사용자 (B)의 ID
 * @property {string} followerNickName - 언팔로우 한 사용자 (A)의 닉네임
 * @property {string} followingNickName - 언팔로우 당한 사용자 (B)의 닉네임
 * @property {string|null} followerProfileImageUrl - 언팔로우 한 사용자 (A)의 프로필 이미지 URL
 * @property {string|null} followingProfileImageUrl - 언팔로우 당한 사용자 (B)의 프로필 이미지 URL
 * @property {number} followerCount - 언팔로우 후 B의 팔로워 수
 * @property {number} followingCount - 언팔로우 후 A의 팔로잉 수
 * @property {boolean} followedStatus - A가 B를 팔로우했는지 여부 (언팔로우 후 항상 false)
 */
export interface UnfollowResponse {
    followerId: number;
    followingId: number;
    followerNickName: string;
    followingNickName: string;
    followerProfileImageUrl: string | null;
    followingProfileImageUrl: string | null;
    followerCount: number;
    followingCount: number;
    followedStatus: boolean;
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
    followUser: (targetId: number) => Promise<FollowResponse | null>;
    unfollowUser: (targetId: number) => Promise<UnfollowResponse | null>; // ✅ 수정됨
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
     * ✅ targetId(B)를 팔로우하고 상태 업데이트
     * 팔로우 요청 성공 시:
     * 1️⃣ 현재 로그인한 유저(A)의 `following` 목록에 B 추가
     * 2️⃣ targetId(B)의 `followers` 목록에 A 추가
     * @param {number} targetId - 팔로우할 사용자(B)의 ID
     * @returns {Promise<FollowResponse | null>} 팔로우 응답 데이터 또는 null
     */
    followUser: async (targetId) => {
        try {
            console.log(`📤 [팔로우 요청] -> ${targetId}`);
            const response = await followUser(targetId);

            if (response) {
                // 팔로우 성공 시 following 배열에 새 항목 추가
                set((state) => ({
                    following: [
                        ...state.following,
                        {
                            followingId: response.followingId, // ✅ A의 팔로잉 목록에 B 추가
                            followingNickName: response.followingNickName,
                            followingName: response.followingName || null,
                            followingProfileImageUrl: response.followingProfileImageUrl || null,
                        },
                    ],
                    followers: [
                        ...state.followers,
                        {
                            followerId: response.followerId, // ✅ B의 팔로워 목록에 A 추가
                            followerNickName: response.followerNickName,
                            followerName: response.followerName || null,
                            followerProfileImageUrl: response.followerProfileImageUrl || null,
                        },
                    ],
                }));
                return response;
            }
            return null;
        } catch (error) {
            console.error('❌ [팔로우 요청 실패]:', error);
            return null;
        }
    },

    /**
     * ✅ targetId(B)를 언팔로우하고 상태 업데이트
     * 언팔로우 요청 성공 시:
     * 1️⃣ 현재 로그인한 유저(A)의 `following` 목록에서 B 제거
     * 2️⃣ targetId(B)의 `followers` 목록에서 A 제거
     * 3️⃣ 팔로워/팔로잉 수 업데이트
     * @param {number} targetId - 언팔로우할 사용자(B)의 ID
     * @returns {Promise<UnfollowResponse | null>} 언팔로우 성공 시 응답 데이터
     */
    unfollowUser: async (targetId) => {
        try {
            console.log(`📤 [언팔로우 요청] -> ${targetId}`);
            const response = await unfollowUser(targetId);

            if (!response) {
                console.warn('⚠️ [언팔로우 응답 없음] 예상치 못한 문제 발생');
                return null;
            }

            console.log('✅ [언팔로우 성공]', response);

            const { userData } = userStore();

            // ✅ 언팔로우 성공 시, following & followers에서 제거 + 팔로워/팔로잉 수 업데이트
            set((state) => ({
                following: state.following.filter(user => user.followingId !== targetId),
                followers: state.followers.filter(user => user.followerId !== Number(userData.id)),
            }));

            return response;
        } catch (error) {
            console.error('❌ [언팔로우 요청 실패]:', error);
            return null;
        }
    },
}));

export default followStore;
