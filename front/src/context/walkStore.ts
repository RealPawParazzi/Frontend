import { create } from 'zustand';
import { saveWalkData, getWalkHistory } from '../services/walkService';

/** ✅ 산책 데이터 타입 */
interface Walk {
    id: number; // walkId 추가
    petId: number;
    startTime: string;
    endTime: string;
    distance: number;
    averageSpeed: number;
    route: { latitude: number; longitude: number; timestamp: string }[];
}

/** ✅ Zustand Store */
interface WalkStore {
    walks: { [key: number]: Walk };
    saveWalk: (petId: number, route: { latitude: number; longitude: number; timestamp: string }[], startTime: string, endTime: string) => Promise<number | null>; // 리턴 타입 변경
    fetchWalk: (walkId: number) => Promise<void>; // fetchWalk으로 변경
}

const walkStore = create<WalkStore>((set) => ({
    walks: {},

    /** ✅ 산책 기록 저장 후 walkId 반환 */
    saveWalk: async (petId, route, startTime, endTime) => {
        try {
            const savedWalk = await saveWalkData(petId, route, startTime, endTime);

            if (!savedWalk || !savedWalk.id) {
                console.warn('⚠️ [산책 기록 저장됨] 하지만 walkId 없음. 기본 값 처리');
                return null; // walkId가 없는 경우 null 반환
            }

            set((state) => ({
                walks: { ...state.walks, [savedWalk.id]: savedWalk }, // walkId 기준으로 저장
            }));
            return savedWalk.id; // walkId 반환
        } catch (error) {
            console.error('❌ [산책 기록 저장 실패]:', error);
            return null; // 실패 시 null 반환
        }
    },

    /** ✅ 특정 산책 기록 불러오기 */
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
                console.warn(`⚠️ [산책 기록 없음] walkId: ${walkId}, 기본 데이터로 초기화`);
                set((state) => ({
                    walks: { ...state.walks, [walkId]: { id: walkId, petId: 0, startTime: '', endTime: '', distance: 0, averageSpeed: 0, route: [] } },
                }));
            } else {
                console.error('❌ [산책 기록 불러오기 실패]:', error);
            }
        }
    },
}));

export default walkStore;
