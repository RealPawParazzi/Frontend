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

/** ✅ 반려동물 데이터 타입 정의 */
interface PetData {
  name: string;
  type: string;
  birthDate?: string; // 생략 또는 null 시 서버에서 오늘 날짜로 처리
  petDetail: string;
}

/** ✅ 이미지 파일 데이터 타입 */
interface FileData {
  uri: string;
  name: string;
  type: string;
}

/** ✅ 배틀 상태 정의 */
interface BattleState {
  loading: boolean; // 로딩 여부
  error: string | null; // 에러 메시지
  battleResult: BattleResponse | null; // 배틀 결과 요약
  battleDetail: BattleDetail | null; // 배틀 상세 정보

  requestBattleAction: (myPetId: number, targetPetId: number) => Promise<void>; // 일반 배틀 요청
  fetchBattleDetailAction: (battleId: number) => Promise<void>; // 상세 조회
  requestOneInstanceBattleAction: (
    targetPetId: number,
    petData: PetData,
    image: FileData,
  ) => Promise<void>; // 1명 즉석 생성 배틀
  requestTwoInstanceBattleAction: (
    pet1: PetData,
    image1: FileData,
    pet2: PetData,
    image2: FileData,
  ) => Promise<void>; // 2명 즉석 생성 배틀

  resetBattle: () => void; // 상태 초기화
}

/** ✅ Zustand 전역 배틀 스토어 생성 */
const useBattleStore = create<BattleState>(set => ({
  loading: false,
  error: null,
  battleResult: null,
  battleDetail: null,

  /** 🟡 일반 배틀 요청 */
  requestBattleAction: async (myPetId, targetPetId) => {
    set({loading: true, error: null});
    try {
      const res = await requestBattle(myPetId, targetPetId);
      set({battleResult: res});
    } catch (err: any) {
      set({error: err.message || '배틀 요청 중 오류 발생'});
    } finally {
      set({loading: false});
    }
  },

  /** 🟡 배틀 상세 정보 불러오기 */
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

  /** 🟡 1명 즉석 생성 배틀 요청 */
  requestOneInstanceBattleAction: async (targetPetId, petData, image) => {
    set({loading: true, error: null});
    try {
      const result = await requestOneInstanceBattle(
        targetPetId,
        petData,
        image,
      );
      set({battleResult: result});
    } catch (err: any) {
      set({error: err.message || '즉석 배틀 실패'});
    } finally {
      set({loading: false});
    }
  },

  /** 🟡 2명 즉석 생성 배틀 요청 */
  requestTwoInstanceBattleAction: async (pet1, image1, pet2, image2) => {
    set({loading: true, error: null});
    try {
      const result = await requestTwoInstanceBattle(pet1, image1, pet2, image2);
      set({battleResult: result});
    } catch (err: any) {
      set({error: err.message || '즉석 배틀 실패'});
    } finally {
      set({loading: false});
    }
  },

  /** 🔄 상태 초기화 */
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
