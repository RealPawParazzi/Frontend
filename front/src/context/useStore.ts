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

/** ✅ Zustand 전역 상태 생성 */
const useStore = create<{ userData: UserData }>(() => ({
    userData: {
        id: 'user123',
        name: '부기부기',
        profileImage: require('../assets/Images/profile-1.png'),
        petCount: 3,
        petList: [
            { id: '1', name: '김초코', species: '강아지', image: require('../assets/Images/1.jpg')  },
            { id: '2', name: '딸기', species: '고양이' , image: require('../assets/Images/cat-1.jpg') },
            { id: '3', name: '바닐라', species: '고양이' , image: require('../assets/Images/cat-2.jpg') },
        ],
        recentPosts: [
            { id: '1', title: '오늘은 스벅 방문기 ~', image: require('../assets/Images/post-1.jpeg') },
            { id: '2', title: '내일은 투썸 방문기', image: require('../assets/Images/post-2.jpg') },
        ],
    },
}));

export default useStore;
