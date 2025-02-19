import { create } from 'zustand';

/** ✅ 전역 데이터 타입 정의 */
interface Pet {
    id: string;
    name: string;
    species: string;
    image: any;
}

interface Post {
    id: string;
    title: string;
    image: any;
}

interface UserData {
    id: string;
    name: string;
    profileImage: string;
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



/** ✅ Zustand 전역 상태 생성 */
const useStore = create(() => ({
    /** ✅ 사용자 데이터 */
    userData: {
        id: 'user123',
        name: '부기부기',
        profileImage: require('../assets/images/profile-1.png'),
        petCount: 3,
        petList: [
            { id: '1', name: '김초코', species: '강아지', image: require('../assets/images/1.jpg')  },
            { id: '2', name: '딸기', species: '고양이' , image: require('../assets/images/cat-1.jpg') },
            { id: '3', name: '바닐라', species: '고양이' , image: require('../assets/images/cat-2.jpg') },
        ],
        recentPosts: [
            { id: '1', title: '오늘은 스벅 방문기 ~', image: require('../assets/images/post-1.jpeg') },
            { id: '2', title: '내일은 투썸 방문기', image: require('../assets/images/post-2.jpg') },
        ],
    },

    /** ✅ 메모리 영상 리스트 */
    memoryVideos: [
        { id: '1', title: '초코네 스벅 다녀옴~!!', video: require('../assets/videos/memory1.mp4') },
    ],

    /** ✅ 팔로우 추천 리스트 */
    followRecommendations: [
        { id: '1', name: '초코네', profileImage: require('../assets/images/cat-3.jpg') },
        { id: '2', name: '댕댕이네', profileImage: require('../assets/images/pets-1.jpg') },
        { id: '3', name: '냥냥이네', profileImage: require('../assets/images/pets-2.jpg') },
    ],

    /** ✅ 오늘의 스토리북 리스트 */
    storyBooks: [
        { id: '1', title: '코코의 하루', thumbnail: require('../assets/images/pets-4.jpeg'), author: '김철수' },
        { id: '2', title: '오늘의 산책!', thumbnail: require('../assets/images/pets-3.gif'), author: '홍길동' },
    ],

    storyReels: [
        { id: '1', image: require('../assets/images/pets-2.jpg') },
        { id: '2', image: require('../assets/images/cat-3.jpg'), video: require('../assets/videos/memory1.mp4') },
        { id: '3', image: require('../assets/images/pets-1.jpg') },
    ],

    activityLog: {
        '2024-06-10': [
            { id: '1', title: '초코와 공원 산책', image: require('../assets/images/post-1.jpeg') },
        ],
        '2024-06-26': [
            { id: '2', title: '오늘은 스벅 방문기 ~', image: require('../assets/images/post-2.jpg') },
        ],
    },
}));

export default useStore;
