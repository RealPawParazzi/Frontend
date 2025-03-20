// userStore.ts

import { create } from 'zustand';
import { fetchAllUsers, fetchUserData } from '../services/userService';
import petStore, { loadPetData } from './petStore'; // ✅ 펫 데이터 가져오기
import boardStore, { loadBoardData } from './boardStore'; // ✅ 게시물 데이터 가져오기


/** ✅ 전역 데이터 타입 정의 */
interface Pet {
    id: string;
    name: string;
    species: string;
    image: any; // require 유지
}

interface Post {
    id: string;
    title: string;
    image: any;
}

interface UserData {
    id: string;
    email: string; // 이메일 추가
    nickName: string; // 닉네임 추가
    name: string;
    profileImage: any; // require 유지
    petCount: number;
    petList: Pet[];
    recentPosts: Post[];
}

/** ✅ 데이터 타입 정의 */
interface MemoryVideo {
    id: string;
    title: string;
    video: any; // require() 사용
}

interface FollowRecommendation {
    id: string;
    name: string;
    profileImage: any;
}

interface StoryBook {
    id: string;
    title: string;
    thumbnail: any;
    author: string;
}



/** ✅ 기본 더미 데이터 */
const defaultUserData: UserData = {
    id: '99999999',
    email: 'dummy-user@example.com', // 기본 이메일 추가
    nickName: '더미 닉네임', // 기본 닉네임 추가
    name: '더미 사용자',
    profileImage: require('../assets/images/user-2.png'), //  require 유지
    petCount: 2,
    petList: [
        { id: '1', name: '김초코', species: '강아지', image: require('../assets/images/pets-3.gif') },
        { id: '2', name: '딸기', species: '고양이', image: require('../assets/images/pets-2.jpg') },
    ],
    recentPosts: [
        { id: '1', title: '오늘은 스벅 방문기 ~', image: require('../assets/images/post-1.jpeg') },
        { id: '2', title: '내일은 투썸 방문기', image: require('../assets/images/post-2.jpg') },
    ],
};

/** ✅ 펫 데이터 & 게시물 데이터 변환 함수 */
const transformData = () => {
    const updatedPetList = petStore.getState().pets.map((pet) => ({
        id: String(pet.petId),
        name: pet.name,
        species: pet.type,
        image: pet.petImg ? { uri: pet.petImg } : require('../assets/images/pets-1.jpg'),
    }));

    const updatedRecentPosts = boardStore.getState().boardList.map((board) => ({
        id: String(board.id),
        title: board.title,
        image: board.titleImage ? { uri: board.titleImage } : require('../assets/images/post-1.jpeg'),
    }));

    return { updatedPetList, updatedRecentPosts };
};

/** ✅ Zustand 전역 상태 생성 */
const userStore = create<{
    userData: UserData;
    allUsers: UserData[]; // ✅ 전체 유저 목록 상태 추가
    loadAllUsers: () => Promise<void>; // ✅ 전체 유저 불러오기 함수
    memoryVideos: { id: string; title: string; video: any }[];
    followRecommendations: { id: string; name: string; profileImage: any }[];
    loadFollowRecommendations: () => Promise<void>;
    storyBooks: { id: string; title: string; thumbnail: any; author: string }[];
    storyReels: { id: string; image: any; video?: any }[];
    activityLog: { [key: string]: Post[] };
    updateUserData: (newUserData: UserData) => void;
    resetUserData: () => void;
}>((set) => ({
    /** ✅ 사용자 데이터 (초기값: 기본 더미 데이터) */
    userData: defaultUserData,

    allUsers: [], // 전체 유저 목록

    /** ✅ 전체 유저 데이터 불러오기 */
    loadAllUsers: async () => {
        try {
            const users = await fetchAllUsers();

            // ✅ UserData 타입에 맞게 변환
            const formattedUsers: UserData[] = users.map((user) => ({
                id: user.id,
                name: user.name,
                nickName: user.nickName,
                email: user.email || '',
                profileImage: user.profileImage, // ✅ profileImage 유지
                petCount: 0,
                petList: [],
                recentPosts: [],
            }));

            set({ allUsers: formattedUsers });
        } catch (error) {
            console.error('❌ 전체 유저 목록 불러오기 실패:', error);
        }
    },


    /** ✅ 메모리 영상 리스트 */
    memoryVideos: [
        { id: '1', title: '초코네 스벅 다녀옴~!!', video: require('../assets/videos/memory1.mp4') },
    ],

    /** ✅ 팔로우 추천 리스트 */
    followRecommendations: [
        { id: '1', name: '초코네', profileImage: require('../assets/images/pets-1.jpg') },
        { id: '2', name: '댕댕이네', profileImage: require('../assets/images/pets-4.jpeg') },
    ],

    /** ✅ 서버에서 전체 유저 가져와서 랜덤 추천 리스트 생성 */
    loadFollowRecommendations: async () => {
        try {
            const users = await fetchAllUsers();

            // ✅ 가입된 유저 데이터 가공
            const recommendations = users.slice(0, 4).map((user) => ({
                id: user.id,
                name: user.nickName || user.name,
                profileImage: user.profileImage, // ✅ profileImage 유지
            }));

            set({ followRecommendations: recommendations });
        } catch (error) {
            console.error('❌ 팔로우 추천 데이터 불러오기 실패:', error);
        }
    },

    /** ✅ 오늘의 스토리북 리스트 */
    storyBooks: [
        { id: '1', title: '코코의 하루', thumbnail: require('../assets/images/pets-3.gif'), author: '김철수' },
    ],

    /** ✅ 스토리 릴스 */
    storyReels: [
        { id: '1', image: require('../assets/images/pets-2.jpg') },
        { id: '2', image: require('../assets/images/cat-3.jpg'), video: require('../assets/videos/memory1.mp4') },
    ],

    /** ✅ 활동 로그 */
    activityLog: {
        '2024-06-10': [{ id: '1', title: '초코와 공원 산책', image: require('../assets/images/post-1.jpeg') }],
    },

    /** ✅ 사용자 데이터 업데이트 함수 */
    updateUserData: (newUserData) => {
        // ✅ 펫 리스트 변환 (petStore → userStore의 Pet 타입 맞추기)
        const { updatedPetList, updatedRecentPosts } = transformData();

        set({
            userData: {
                id: newUserData.id || defaultUserData.id,
                email: newUserData.email || defaultUserData.email,
                nickName: newUserData.nickName || defaultUserData.nickName,
                name: newUserData.name || defaultUserData.name,
                profileImage: newUserData.profileImage || defaultUserData.profileImage, // require 유지
                petCount: updatedPetList.length, // ✅ 펫 수 자동 계산
                petList: updatedPetList.length ? updatedPetList : defaultUserData.petList, // ✅ 펫 데이터 보완
                recentPosts: updatedRecentPosts.length ? updatedRecentPosts : defaultUserData.recentPosts, // ✅ 게시물 데이터 보완
            },
        });
    },

    resetUserData: () => set({ userData: defaultUserData }),
}));



/**
 * ✅ 사용자 정보 자동 로딩 (앱 실행 시)
 */
export const loadUserData = async () => {
    try {

        const userInfo = await fetchUserData();

        // ✅ 펫 데이터 및 게시물 데이터 불러오기
        await loadPetData(); // ✅ userId 제거 후 호출
        await loadBoardData(Number(userInfo.id)); // 게시물 리스트는 기존대로 userId 필요

        console.log('✅ 불러온 사용자 ID:', userInfo.id);

        // ✅ 최신 펫 데이터와 게시물 데이터 변환
        const { updatedPetList, updatedRecentPosts } = transformData();

        // API 응답이 불완전할 경우, 기본값 적용
        userStore.getState().updateUserData({
            id: userInfo.id,
            email: userInfo.email,
            nickName: userInfo.nickName,
            name: userInfo.name,
            profileImage: userInfo.profileImage || require('../assets/images/profile-1.png'),
            petList: updatedPetList,
            petCount: updatedPetList.length, // ✅ 펫 카운트 자동 업데이트
            recentPosts: updatedRecentPosts,
        });
    } catch (error) {
        console.error('❌ 사용자 정보 로드 실패:', error);
    }
};

export default userStore;
