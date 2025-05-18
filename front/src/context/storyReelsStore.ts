// 📁 context/storyReelsStore.ts
import { create } from 'zustand';
import {
    uploadStory,
    fetchGroupedStories,
    fetchMyStories,
    fetchStoryDetail,
    deleteStory,
    fetchStoryViewers,
} from '../services/storyReelsService';

// ✅ 단일 스토리 객체 타입 정의
interface Story {
    storyId: number;             // 스토리 ID
    mediaUrl: string;           // 스토리 이미지 또는 영상 URL
    caption: string;            // 스토리에 첨부된 설명 텍스트 (optional)
    createdAt: string;          // 생성 시간 (ISO 형식 문자열)
    expired: boolean;           // 만료 여부 (24시간 지나면 true)
    viewed: boolean;            // 사용자가 이 스토리를 조회했는지 여부
}

// ✅ 유저별 스토리 그룹 (스토리를 가진 유저 목록)
interface UserStoryGroup {
    memberId: number;           // 사용자 ID
    nickname: string;          // 사용자 닉네임
    profileImageUrl: string;   // 사용자 프로필 이미지
    stories: Story[];          // 해당 사용자의 스토리 배열
}

// ✅ 스토리를 본 사용자에 대한 정보
interface Viewer {
    viewerId: number;              // 조회자 ID
    viewerNickname: string;       // 조회자 닉네임
    viewerProfileImageUrl: string;// 조회자 프로필 이미지 URL
    viewedAt: string;             // 조회 시간 (ISO 형식 문자열)
}

// ✅ Zustand에서 관리할 상태 인터페이스 정의
interface StoryReelsState {
    groupedStories: UserStoryGroup[];  // 전체 사용자 스토리 목록 (스토리 있는 사용자만)
    myStories: Story[];                // 내 스토리 목록
    storyViewers: Viewer[];           // 특정 스토리를 본 사람 목록
    isLoading: boolean;               // 로딩 중인지 여부
    error: string | null;             // 에러 메시지 (null이면 에러 없음)

    // ✅ 액션 함수들 (비동기 상태 변경 로직 포함)
    loadGroupedStories: () => Promise<void>;
    loadMyStories: () => Promise<void>;
    uploadNewStory: (
        file: { uri: string; name: string; type: string },
        caption?: string
    ) => Promise<void>;
    loadStoryDetail: (storyId: number) => Promise<void>;
    deleteMyStory: (storyId: number) => Promise<void>;
    loadStoryViewers: (storyId: number) => Promise<void>;
    resetError: () => void;
}

export const useStoryReelsStore = create<StoryReelsState>((set) => ({
    // 🔸 초기 상태 정의
    groupedStories: [],   // 전체 사용자 스토리 그룹
    myStories: [],        // 내 스토리들
    storyViewers: [],     // 특정 스토리를 본 사용자 목록
    isLoading: false,     // 로딩 중인지 여부
    error: null,          // 에러 메시지

    // 🔸 에러 초기화 (UI에서 dismiss 등으로 사용 가능)
    resetError: () => set({ error: null }),

    // 🔸 전체 사용자 스토리 목록 불러오기
    loadGroupedStories: async () => {
        try {
            set({ isLoading: true }); // 로딩 시작
            const data = await fetchGroupedStories(); // API 호출
            set({ groupedStories: data, isLoading: false }); // 데이터 세팅 후 로딩 종료
        } catch (e: any) {
            set({ error: e.message, isLoading: false }); // 에러 발생 시 메시지 저장
        }
    },

    // 🔸 내 스토리 목록 불러오기
    loadMyStories: async () => {
        try {
            set({ isLoading: true });
            const data = await fetchMyStories();
            set({ myStories: data, isLoading: false });
        } catch (e: any) {
            set({ error: e.message, isLoading: false });
        }
    },

    // 🔸 새 스토리 업로드 (업로드 후 내 스토리 및 전체 스토리 그룹 재로딩)
    uploadNewStory: async (file, caption) => {
        try {
            set({ isLoading: true });
            await uploadStory(file, caption); // 스토리 업로드 요청
            // 업로드 후 목록 갱신 (병렬 처리)
            await Promise.all([
                useStoryReelsStore.getState().loadMyStories(),
                useStoryReelsStore.getState().loadGroupedStories(),
            ]);
            set({ isLoading: false });
        } catch (e: any) {
            set({ error: e.message, isLoading: false });
        }
    },

    // 🔸 내 스토리 삭제
    deleteMyStory: async (storyId) => {
        try {
            set({ isLoading: true });
            await deleteStory(storyId); // 삭제 API 호출
            await useStoryReelsStore.getState().loadMyStories(); // 삭제 후 내 목록만 다시 불러옴
            set({ isLoading: false });
        } catch (e: any) {
            set({ error: e.message, isLoading: false });
        }
    },

    // 🔸 특정 스토리의 조회자 목록 불러오기
    loadStoryViewers: async (storyId) => {
        try {
            set({ isLoading: true });
            const viewers = await fetchStoryViewers(storyId); // 조회자 API 호출
            set({ storyViewers: viewers, isLoading: false });
            console.log(`🔍 ${storyId} 의 조회자 목록 (스토어 계층)`, viewers);
            return viewers; // 👈 이걸 추가해야 caller에서 받아서 쓸 수 있음
        } catch (e: any) {
            set({ error: e.message, isLoading: false });
        }
    },

    // ✅ 단일 스토리 상세 정보 조회 및 viewed 처리 (서버 기록 목적)
    loadStoryDetail: async (storyId) => {
        try {
            await fetchStoryDetail(storyId); // 👉 서버에 조회 기록만 반영
        } catch (e: any) {
            set({ error: e.message });
        }
    },
}));

