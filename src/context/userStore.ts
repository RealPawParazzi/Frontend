// userStore.ts

import {create} from 'zustand';
import {
  fetchAllUsers,
  fetchUserData,
  updateUser,
} from '../services/userService';
import petStore, {loadPetData} from './petStore'; // ✅ 펫 데이터 가져오기
import boardStore, {loadBoardData} from './boardStore';
import {ReactNode} from 'react'; // ✅ 게시물 데이터 가져오기

/** ✅ 이미지 소스 타입 정의 */
type ImageSource = {uri: string};
type VideoSource = {uri: string};

/** ✅ 전역 데이터 타입 정의 */
interface Pet {
  id: string;
  name: string;
  species: string;
  image: ImageSource;
}

interface Post {
  id: string;
  title: string;
  image: ImageSource;
}

interface UserData {
  id: string;
  email: string;
  nickName: string;
  name: string;
  profileImage: ImageSource;
  petCount: number;
  petList: Pet[];
  recentPosts: Post[];
}

/** ✅ 데이터 타입 정의 */
interface MemoryVideo {
  id: string;
  title: string;
  video: VideoSource;
}

interface FollowRecommendation {
  nickName: string | null;
  id: string;
  name: string;
  profileImage: ImageSource;
}

interface StoryBook {
  id: string;
  title: string;
  thumbnail: ImageSource;
  author: string;
}

interface StoryReel {
  id: string;
  image: ImageSource;
  video?: VideoSource;
}

/** ✅ 배틀용 상대 타입 정의 */
export interface BattleOpponent {
  id: string;
  name: string;
  nickName: string;
  profileImage: ImageSource;
  petList: Pet[];
}

/** ✅ 프로필 이미지 정규화 함수 */
const normalizeImage = (img: any) => {
  if (!img) {
    return require('../assets/images/user-2.png');
  }
  if (typeof img === 'string') {
    return {uri: img};
  }
  if (typeof img === 'number') {
    console.warn('⚠️ 숫자 타입 프로필 이미지 감지됨. 기본 이미지로 대체:', img);
    return require('../assets/images/user-2.png');
  }
  if (img?.uri && typeof img.uri === 'string') {
    return {uri: img.uri};
  }
  return require('../assets/images/user-2.png');
};

/** ✅ 기본 더미 데이터 */
const defaultUserData: UserData = {
  id: '0',
  email: 'dummy-user@example.com', // 기본 이메일 추가
  nickName: '더미 닉네임', // 기본 닉네임 추가
  name: '더미 사용자',
  profileImage: require('../assets/images/user-2.png'), //  require 유지
  petCount: 0,
  petList: [],
  recentPosts: [
    {
      id: '1',
      title: '오늘은 스벅 방문기 ~',
      image: require('../assets/images/post-1.jpeg'),
    },
    {
      id: '2',
      title: '내일은 투썸 방문기',
      image: require('../assets/images/post-2.jpg'),
    },
  ],
};

/** ✅ 펫 데이터 & 게시물 데이터 변환 함수 */
const transformData = () => {
  const updatedPetList = petStore.getState().pets.map(pet => ({
    id: String(pet.petId),
    name: pet.name,
    species: pet.type,
    image: pet.petImg
      ? {uri: String(pet.petImg)}
      : require('../assets/images/pets-1.jpg'),
  }));

  const updatedRecentPosts = boardStore.getState().boardList.map(board => ({
    id: String(board.id),
    title: board.title,
    image: board.titleImage
      ? {uri: String(board.titleImage)}
      : require('../assets/images/post-1.jpeg'),
  }));

  return {updatedPetList, updatedRecentPosts};
};

/** ✅ Zustand 전역 상태 생성 */
const userStore = create<{
  userData: UserData;
  allUsers: UserData[];
  loadAllUsers: () => Promise<void>;
  memoryVideos: MemoryVideo[];
  followRecommendations: FollowRecommendation[];
  loadFollowRecommendations: () => Promise<void>;
  storyBooks: StoryBook[];
  storyReels: StoryReel[];
  activityLog: {[key: string]: Post[]};
  //  배틀 상대 리스트 상태 및 함수 추가
  battleOpponents: BattleOpponent[];
  loadBattleOpponents: () => Promise<void>;

  /** ✅ 이 함수 내부에서 API 호출도 함께 수행 */
  updateUserData: (
    updateData: Partial<UserData>,
    profileImage?: {uri: string; name: string; type: string},
  ) => Promise<void>;

  setUserData: (userData: UserData) => void;
  resetUserData: () => void;
}>(set => ({
  /** ✅ 사용자 데이터 (초기값: 기본 더미 데이터) */
  userData: defaultUserData,
  allUsers: [],

  // 배틀 상대 리스트 상태
  battleOpponents: [],

  /** ✅ 전체 유저 데이터 불러오기 */
  loadAllUsers: async () => {
    try {
      const users = await fetchAllUsers();

      // ✅ UserData 타입에 맞게 변환
      const formattedUsers: UserData[] = users.map(user => ({
        id: user.id,
        name: user.name,
        nickName: user.nickName,
        email: user.email || '',
        profileImage: user.profileImage
          ? {uri: String(user.profileImage)}
          : require('../assets/images/profile-1.png'),
        petCount: 0,
        petList: [],
        recentPosts: [],
      }));

      set({allUsers: formattedUsers});
    } catch (error) {
      console.error('❌ 전체 유저 목록 불러오기 실패:', error);
    }
  },

  /** ✅ 메모리 영상 리스트 */
  memoryVideos: [
    {
      id: '1',
      title: '초코네 스벅 다녀옴~!!',
      video: require('../assets/videos/memory1.mp4'),
    },
  ],

  /** ✅ 팔로우 추천 리스트 */
  followRecommendations: [
    {
      id: '1',
      name: '초코네',
      nickName: '초코',
      profileImage: require('../assets/images/pets-1.jpg'),
    },
    {
      id: '2',
      name: '댕댕이네',
      nickName: '댕댕이',
      profileImage: require('../assets/images/pets-4.jpeg'),
    },
  ],

  /** ✅ 서버에서 전체 유저 가져와서 랜덤 추천 8명 리스트 생성 */
  loadFollowRecommendations: async () => {
    try {
      const users = await fetchAllUsers();

      // ✅ 가입된 유저 데이터 가공
      const recommendations: FollowRecommendation[] = users
        .slice(0, 8) // 추천 유저 8명 출력
        .map(user => ({
          id: user.id,
          name: user.name,
          nickName: user.nickName,
          profileImage: user.profileImage
            ? {uri: String(user.profileImage)}
            : require('../assets/images/user-2.png'),
        }));

      set({followRecommendations: recommendations});
    } catch (error) {
      console.error('❌ 팔로우 추천 데이터 불러오기 실패:', error);
    }
  },

  /** ✅ 배틀 상대용 유저 리스트 로드 */
  loadBattleOpponents: async () => {
    try {
      const users = await fetchAllUsers();
      const shuffled = users.sort(() => 0.5 - Math.random()).slice(0, 5);

      const battleList: BattleOpponent[] = shuffled.map(user => ({
        id: user.id,
        name: user.name,
        nickName: user.nickName,
        profileImage: user.profileImage
          ? {uri: String(user.profileImage)}
          : require('../assets/images/user-2.png'),
        petList: (user.petList || []).map((pet: any) => ({
          id: String(pet.petId),
          name: pet.name,
          species: pet.type,
          image: pet.petImg
            ? {uri: String(pet.petImg)}
            : require('../assets/images/pets-1.jpg'),
        })),
      }));

      set({battleOpponents: battleList});
    } catch (error) {
      console.error('❌ 배틀 상대 유저 불러오기 실패:', error);
    }
  },


  /** ✅ 오늘의 스토리북 리스트 */
  storyBooks: [
    {
      id: '1',
      title: '코코의 하루',
      thumbnail: require('../assets/images/pets-3.gif'),
      author: '김철수',
    },
  ],

  /** ✅ 스토리 릴스 */
  storyReels: [
    {
      id: '1',
      image: require('../assets/images/pets-2.jpg'),
    },
    {
      id: '2',
      image: require('../assets/images/cat-3.jpg'),
      video: require('../assets/videos/memory1.mp4'),
    },
  ],

  /** ✅ 활동 로그 */
  activityLog: {
    '2024-06-10': [
      {
        id: '1',
        title: '초코와 공원 산책',
        image: require('../assets/images/post-1.jpeg'),
      },
    ],
  },

  /** ✅ 사용자 데이터 업데이트 함수 */
  updateUserData: async (
    updateData: Partial<UserData>,
    profileImage?: {uri: string; name: string; type: string},
  ) => {
    try {
      const updated = await updateUser(updateData, profileImage);

      // ✅ 응답이 null일 경우 방어
      if (!updated) {
        console.warn('⚠️ 서버 응답이 없습니다. 사용자 정보 업데이트 중단');
        return;
      }

      const normalizedImage = normalizeImage(updated.profileImageUrl);
      // const { updatedPetList, updatedRecentPosts } = transformData();

      set(state => ({
        userData: {
          ...state.userData,
          name: updated.name,
          nickName: updated.nickName,
          profileImage: normalizedImage,
          // petCount: updatedPetList.length,
          // petList: updatedPetList.length ? updatedPetList : state.userData.petList,
          // recentPosts: updatedRecentPosts.length ? updatedRecentPosts : state.userData.recentPosts,
        },
      }));
    } catch (error: any) {
      console.error('❌ 사용자 정보 수정 실패:', error);
      throw new Error(error.message || '사용자 정보 수정 중 오류 발생');
    }
  },

  setUserData: userData => set(() => ({userData})),

  resetUserData: () => set({userData: defaultUserData}),
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
    const {updatedPetList, updatedRecentPosts} = transformData();

    // API 응답이 불완전할 경우, 기본값 적용
    userStore.getState().setUserData({
      id: userInfo.id,
      email: userInfo.email,
      nickName: userInfo.nickName,
      name: userInfo.name,
      profileImage: normalizeImage(userInfo.profileImage),
      petList: updatedPetList,
      petCount: updatedPetList.length, // ✅ 펫 카운트 자동 업데이트
      recentPosts: updatedRecentPosts,
    });
  } catch (error) {
    console.error('❌ 사용자 정보 로드 실패:', error);
  }
};

export default userStore;
