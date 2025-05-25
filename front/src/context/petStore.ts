import {create} from 'zustand';
import {
  getPetList,
  registerPet,
  updatePet,
  deletePet,
  getPetDetail,
  getRankedPets,
} from '../services/petService';

/** ✅ 반려동물 데이터 타입 */
export interface Pet {
  petId: number;
  name: string;
  type: string;
  birthDate: string;
  petImg?: string;
  petDetail?: string;
}

/** ✅ 확장된 펫 랭킹 타입 */
export interface PetRanking extends Pet {
  winCount: number;
  member: {
    name: string;
    email: string;
  };
}

/** ✅ Zustand 상태 타입 */
interface PetStore {
  pets: Pet[];
  fetchPets: () => Promise<void>;
  rankings: PetRanking[]; // ✅ 랭킹 상태 추가

  addPet: (petData: Omit<Pet, 'petId'>, image?: any) => Promise<void>;
  editPet: (
    petId: number,
    petData: Partial<Pet>,
    petImage?: any,
  ) => Promise<void>;
  removePet: (petId: number) => Promise<void>;
  fetchPetDetail: (petId: number) => Promise<Pet>;
  fetchPetRankings: () => Promise<void>; // ✅ 반환 타입 수정
}

/** ✅ 기본 더미 데이터 */
const defaultPets: Pet[] = [
  {
    petId: 0,
    name: '스토어 더미데이터 반려동물',
    type: 'DOG',
    birthDate: '2020-01-01',
    petImg: require('../assets/images/pets-3.gif'),
    petDetail:
      '스토어에서 사용하는 더미 데이터입니다. 실제 반려동물은 아닙니다.',
  },
];

/** ✅ Zustand 전역 상태 */
const petStore = create<PetStore>(set => ({
  pets: defaultPets,
  rankings: [], // ✅ 초기값 추가


  /**
   * ✅ 반려동물 목록 불러오기
   * - API 요청 후 Zustand 상태 업데이트
   */
  fetchPets: async () => {
    try {
      const petList = await getPetList();
      set({pets: petList.length > 0 ? petList : defaultPets});
    } catch (error) {
      console.error('🐶❌ 반려동물 목록 불러오기 실패:', error);
      set({pets: defaultPets});
    }
  },

  /**
   * ✅ 반려동물 추가
   * - API 요청 후 Zustand 상태 업데이트
   */
  addPet: async (petData, petImage) => {
    try {
      const newPet = await registerPet(
        {
          name: petData.name,
          type: petData.type,
          birthDate: petData.birthDate,
          petDetail: petData.petDetail || '',
        },
        petImage,
      );
      set(state => ({pets: [...state.pets, newPet]}));
    } catch (error) {
      console.error('🐶❌ 반려동물 추가 실패:', error);
      throw error;
    }
  },
  /**
   * ✅ 반려동물 정보 수정
   * - API 요청 후 상태 업데이트
   */
  editPet: async (petId, petData, petImage) => {
    try {
      const updatedPet = await updatePet(
        petId,
        {
          name: petData.name,
          type: petData.type,
          birthDate: petData.birthDate,
          petDetail: petData.petDetail || '',
        },
        petImage
          ? {
              uri: String(petImage.uri),
              name: String(petImage.name || 'updated_pet.jpg'),
              type: String(petImage.type || 'image/jpeg'),
            }
          : undefined,
      );

      set(state => ({
        pets: state.pets.map(pet => (pet.petId === petId ? updatedPet : pet)),
      }));
    } catch (error) {
      console.error('🐶❌ 반려동물 정보 수정 실패:', error);
      throw error; // 에러를 상위로 전파하여 UI에서 처리할 수 있도록 함
    }
  },

  /**
   * ✅ 반려동물 삭제
   * - API 요청 후 상태 최신화
   */
  removePet: async petId => {
    try {
      await deletePet(petId);
      await petStore.getState().fetchPets(); // 삭제 후 상태 최신화 보장
    } catch (error) {
      console.error('🐶❌ 반려동물 삭제 실패:', error);
    }
  },
  /** ✅ 특정 반려동물 상세 조회 */
  fetchPetDetail: async petId => {
    try {
      const pet = await getPetDetail(petId);
      return pet;
    } catch (error) {
      console.error('🐶❌ 반려동물 상세 조회 실패:', error);
      throw error;
    }
  },

  /** ✅ 반려동물 랭킹 데이터 저장 */
  fetchPetRankings: async () => {
    try {
      const rankedPets = await getRankedPets(); // 서버 응답이 PetRanking[]
      set({ rankings: rankedPets });
    } catch (error) {
      console.error('🐶❌ 반려동물 랭킹 조회 실패:', error);
      set({ rankings: [] });
    }
  },
}));

/** ✅ 반려동물 전체 데이터 불러오기 */
export const loadPetData = async () => {
  try {
    await petStore.getState().fetchPets();
  } catch (error) {
    console.error('🐾❌ loadPetData 실패:', error);
  }
};

export default petStore;
