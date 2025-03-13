import { create } from 'zustand';
import { saveWalkData, getWalkHistory } from '../services/walkService';

/** ✅ 산책 데이터 타입 */
interface Walk {
    petId: number;
    startTime: string;
    endTime: string;
    distance: number;
    averageSpeed: number;
    route: { latitude: number; longitude: number; timestamp: string }[];
}

/** ✅ Zustand Store */
interface WalkStore {
    walks: { [key: number]: Walk[] };
    saveWalk: (petId: number, route: { latitude: number; longitude: number; timestamp: string }[], startTime: string, endTime: string) => Promise<void>;
    fetchWalks: (petId: number) => Promise<void>;
}

const walkStore = create<WalkStore>((set) => ({
    walks: {},

    /** ✅ 산책 기록 저장 */
    saveWalk: async (petId, route, startTime, endTime) => {
        try {
            const distance = calculateDistance(route);
            const durationInHours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
            const averageSpeed = durationInHours > 0 ? parseFloat((distance / durationInHours).toFixed(2)) : 0;

            const walkData = {
                petId,
                route,
                startTime,
                endTime,
                distance,
                averageSpeed,
            };

            await saveWalkData(petId, route, startTime, endTime);
            set((state) => ({
                walks: { ...state.walks, [petId]: [...(state.walks[petId] || []), walkData] },
            }));
        } catch (error) {
            console.error('❌ [산책 기록 저장 실패]:', error);
        }
    },

    /** ✅ 특정 반려동물의 산책 기록 불러오기 */
    fetchWalks: async (petId) => {
        try {
            const history = await getWalkHistory(petId);
            set((state) => ({ walks: { ...state.walks, [petId]: history } }));
        } catch (error) {
            console.error('❌ [산책 기록 불러오기 실패]:', error);
        }
    },
}));

/** ✅ 거리 계산 함수 (위도/경도를 이용) */
const calculateDistance = (route: { latitude: number; longitude: number }[]) => {
    let totalDistance = 0;
    for (let i = 1; i < route.length; i++) {
        const prev = route[i - 1];
        const curr = route[i];
        totalDistance += Math.sqrt(
            Math.pow(curr.latitude - prev.latitude, 2) + Math.pow(curr.longitude - prev.longitude, 2)
        ) * 111; // 1도당 약 111km
    }
    return parseFloat(totalDistance.toFixed(2)); // 소수점 2자리까지 반환
};

export default walkStore;
