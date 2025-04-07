import { create } from 'zustand';
import {
    saveWalkData,
    getWalkHistory,
    deleteWalkHistory,
    getWalksByPetId,
    getWalksByDate,
    getPetWalksByDate,
} from '../services/walkService';

/** ✅ 산책 경로 좌표 타입 */
interface WalkRoutePoint {
    latitude: number;
    longitude: number;
    timestamp: string;
}

/** ✅ 산책 데이터 타입 */
export interface Walk {
    id: number;
    pet: {
        petId: number;
        name: string;
        type: string;
        petImg: string;
    };
    startTime: string;
    endTime: string;
    distance: number;
    averageSpeed: number;
    route: WalkRoutePoint[];
}

/** ✅ Zustand Store 타입 정의 */
interface WalkStore {
    walks: { [key: number]: Walk }; // walkId를 키로 한 산책 기록 객체
    petWalks: { [petId: number]: Walk[] }; // petId를 키로 한 산책 기록 리스트
    dailyWalks: Walk[]; // 날짜 기반 산책 기록

    saveWalk: (
        petId: number,
        route: WalkRoutePoint[],
        startTime: string,
        endTime: string
    ) => Promise<number | null>;

    fetchWalk: (walkId: number) => Promise<void>;
    deleteWalk: (walkId: number) => Promise<void>;
    fetchWalksByPet: (petId: number) => Promise<void>;
    fetchWalksByDate: (date: string) => Promise<void>;
    fetchPetWalksByDate: (petId: number, date: string) => Promise<Walk[]>;
}

/** ✅ Zustand Store 생성 */
const walkStore = create<WalkStore>((set) => ({
    walks: {},
    petWalks: {},
    dailyWalks: [],


    /** ✅ 산책 기록 저장 후 walkId 반환 */
    saveWalk: async (petId, route, startTime, endTime) => {
        try {
            const savedWalk = await saveWalkData(petId, route, startTime, endTime);
            if (!savedWalk || !savedWalk.id) {
                console.warn('⚠️ [산책 기록 저장됨] 하지만 walkId 없음. 기본 값 처리');
                return null; // walkId가 없는 경우 null 반환
            }

            set((state) => ({
                walks: { ...state.walks, [savedWalk.id]: savedWalk },
                petWalks: {
                    ...state.petWalks,
                    [petId]: [...(state.petWalks[petId] || []), savedWalk],
                },
            }));
            return savedWalk.id;
        } catch (error) {
            console.error('❌ [산책 기록 저장 실패]:', error);
            return null;
        }
    },

    /** ✅ 단일 산책 기록 불러오기 */
    fetchWalk: async (walkId) => {
        if (!walkId) {
            console.warn('⚠️ [산책 기록 조회] walkId가 제공되지 않음, 요청 취소');
            return; // walkId가 없으면 API 요청 안 함
        }

        try {
            const walkData = await getWalkHistory(walkId);
            if (!walkData) {
                console.warn(`⚠️ [산책 기록 조회 실패] walkId: ${walkId} - 빈 값 처리`);
                return;
            }
            set((state) => ({ walks: { ...state.walks, [walkId]: walkData } }));
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.warn(`⚠️ [산책 기록 없음]: walkId ${walkId}`);
            } else {
                console.error('❌ [산책 기록 불러오기 실패]:', error);
            }
        }
    },





    /** ✅ 산책 기록 삭제 */
    deleteWalk: async (walkId) => {
        try {
            await deleteWalkHistory(walkId);
            set((state) => {
                const newWalks = { ...state.walks };
                delete newWalks[walkId];
                return { walks: newWalks };
            });
        } catch (error) {
            console.error('❌ [산책 기록 삭제 실패]:', error);
        }
    },

    /** ✅ 특정 반려동물의 산책 기록 목록 불러오기 */
    fetchWalksByPet: async (petId) => {
        try {
            const walks = await getWalksByPetId(petId);
            set((state) => ({ petWalks: { ...state.petWalks, [petId]: walks } }));
        } catch (error) {
            console.error('❌ [펫 산책 기록 불러오기 실패]:', error);
        }
    },

    /** ✅ 날짜 기반 전체 산책 기록 불러오기 */
    fetchWalksByDate: async (date) => {
        try {
            const walks = await getWalksByDate(date);
            set({ dailyWalks: walks });
        } catch (error) {
            console.error('❌ [날짜별 산책 기록 불러오기 실패]:', error);
        }
    },

    /** ✅ 특정 펫의 특정 날짜 산책 기록 조회 */
    fetchPetWalksByDate: async (petId, date) => {
        try {
            const walks = await getPetWalksByDate(petId, date);
            set((state) => ({
                petWalks: { ...state.petWalks, [petId]: walks },
            }));
            return walks;
        } catch (error) {
            console.error('❌ [펫 날짜별 산책 기록 불러오기 실패]:', error);
            return [];
        }
    },
}));

export default walkStore;
