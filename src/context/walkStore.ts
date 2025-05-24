// 🔹 stores/walkStore.ts

import { create } from 'zustand';
import {
  saveWalkData,
  getWalkHistory,
  deleteWalkHistory,
  getWalksByPetId,
  getWalksByDate,
  getPetWalksByDate,
  getMyAllWalks,
} from '../services/walkService';

/** ✅ 산책 경로 좌표 타입 정의 */
interface WalkRoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
}

/** ✅ 산책 기록 데이터 타입 */
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

/** ✅ Zustand WalkStore 인터페이스 정의 */
interface WalkStore {
  walks: { [walkId: number]: Walk }; // 단일 산책 기록 캐시
  petWalks: { [petId: number]: Walk[] }; // 반려동물별 산책 기록 목록
  dailyWalks: Walk[]; // 특정 날짜의 전체 산책 기록

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

  fetchAllMyWalks: () => Promise<void>;
}


/** ✅ Zustand WalkStore 생성 */
const walkStore = create<WalkStore>((set) => ({
  walks: {},
  petWalks: {},
  dailyWalks: [],

  /** ✅ 산책 기록 저장 후 walkId 반환 */
  saveWalk: async (petId, route, startTime, endTime) => {
    try {
      const savedWalk = await saveWalkData(petId, route, startTime, endTime);
      if (!savedWalk?.id) {
        console.warn('⚠️ [산책 저장됨] walkId 없음');
        return null;
      }

      // 상태 업데이트
      set((state) => ({
        walks: { ...state.walks, [savedWalk.id]: savedWalk },
        petWalks: {
          ...state.petWalks,
          [petId]: [...(state.petWalks[petId] || []), savedWalk],
        },
      }));

      return savedWalk.id;
    } catch (err) {
      console.error('❌ [산책 저장 실패]:', err);
      return null;
    }
  },

  /** ✅ 단건 산책 기록 조회 */
  fetchWalk: async (walkId) => {
    try {
      const walk = await getWalkHistory(walkId);
      set((state) => ({
        walks: { ...state.walks, [walkId]: walk },
      }));
    } catch (err) {
      console.error('❌ [단일 산책 기록 불러오기 실패]:', err);
    }
  },

  /** ✅ 산책 기록 삭제 */
  deleteWalk: async (walkId) => {
    try {
      await deleteWalkHistory(walkId);
      set((state) => {
        const updated = { ...state.walks };
        delete updated[walkId];
        return { walks: updated };
      });
    } catch (err) {
      console.error('❌ [산책 기록 삭제 실패]:', err);
    }
  },

  /** ✅ 특정 반려동물의 산책 기록 목록 조회 */
  fetchWalksByPet: async (petId) => {
    try {
      const data = await getWalksByPetId(petId);
      set((state) => ({
        petWalks: { ...state.petWalks, [petId]: data },
      }));
    } catch (err) {
      console.error('❌ [펫 산책 기록 조회 실패]:', err);
    }
  },

  /** ✅ 특정 날짜 전체 산책 기록 조회 */
  fetchWalksByDate: async (date) => {
    try {
      const data = await getWalksByDate(date);
      set(() => ({ dailyWalks: data }));
    } catch (err) {
      console.error('❌ [날짜별 산책 기록 조회 실패]:', err);
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
    } catch (err) {
      console.error('❌ [펫의 날짜별 산책 기록 조회 실패]:', err);
      return [];
    }
  },

  /** ✅ 로그인한 유저의 전체 산책 기록 */
  fetchAllMyWalks: async () => {
    try {
      const allWalks = await getMyAllWalks();
      const walkMap: { [key: number]: Walk } = {};
      allWalks.forEach((walk) => {
        walkMap[walk.id] = walk;
      });
      set(() => ({ walks: walkMap }));
    } catch (err) {
      console.error('❌ [전체 산책 기록 조회 실패]:', err);
    }
  },
}));

export default walkStore;

