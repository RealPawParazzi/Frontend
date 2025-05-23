// 📦 context/battleStore.ts
import {create} from 'zustand';
import {
  requestBattle,
  fetchBattleDetail,
  requestOneInstanceBattle,
  requestTwoInstanceBattle,
  BattleResponse,
  BattleDetail,
} from '../services/battleService';

interface PetData {
  name: string;
  type: string;
  petDetail: string;
}

interface FileData {
  uri: string;
  name: string;
  type: string;
}

interface BattleState {
  loading: boolean;
  error: string | null;
  battleResult: BattleResponse | null;
  battleDetail: BattleDetail | null;

  requestBattleAction: (myPetId: number, targetPetId: number) => Promise<void>;
  fetchBattleDetailAction: (battleId: number) => Promise<void>;
  requestOneInstanceBattleAction: (
    targetPetId: number,
    petData: PetData,
    image: FileData,
  ) => Promise<void>;
  requestTwoInstanceBattleAction: (
    pet1: PetData,
    image1: FileData,
    pet2: PetData,
    image2: FileData,
  ) => Promise<void>;

  resetBattle: () => void;
}

const useBattleStore = create<BattleState>(set => ({
  loading: false,
  error: null,
  battleResult: null,
  battleDetail: null,

  // ✅ 배틀 신청
  requestBattleAction: async (myPetId, targetPetId) => {
    set({ loading: true, error: null });
    try {
      const res = await requestBattle(myPetId, targetPetId);
      set({ battleResult: res });
    } catch (err: any) {
      set({error: err.message || '배틀 요청 중 오류 발생'});
    } finally {
      set({loading: false});
    }
  },

  // ✅ 배틀 상세 조회
  fetchBattleDetailAction: async battleId => {
    set({loading: true, error: null});
    try {
      const detail = await fetchBattleDetail(battleId);
      set({battleDetail: detail});
    } catch (err: any) {
      set({error: err.message || '배틀 상세 조회 중 오류 발생'});
    } finally {
      set({loading: false});
    }
  },

  requestOneInstanceBattleAction: async (
    targetPetId: number,
    petData: {name: string; type: string; petDetail: string},
    image: {uri: string; name: string; type: string},
  ) => {
    set({ loading: true, error: null });
    try {
      const result = await requestOneInstanceBattle(targetPetId, petData, image);
      set({ battleResult: result });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  requestTwoInstanceBattleAction: async (pet1, image1, pet2, image2) => {
    set({ loading: true, error: null });
    try {
      const result = await requestTwoInstanceBattle(pet1, image1, pet2, image2);
      set({ battleResult: result });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ 초기화 함수
  resetBattle: () => {
    set({
      loading: false,
      error: null,
      battleResult: null,
      battleDetail: null,
    });
  },
}));

export default useBattleStore;
