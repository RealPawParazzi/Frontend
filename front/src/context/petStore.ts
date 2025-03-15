import { create } from 'zustand';
import { getPetList, registerPet, updatePet, deletePet } from '../services/petService';

/** ✅ 반려동물 데이터 타입 */
export interface Pet {
    petId: number;
    name: string;
    type: string; // ✅ 기존 type 유지 (API 명세서 기준)
    birthDate: string; // ✅ 생년월일
    petImg?: string; // ✅ 선택적 필드
}

/** ✅ Zustand 상태 타입 */
interface PetStore {
    pets: Pet[]; // 🐾 반려동물 목록
    fetchPets: () => Promise<void>; // 🔄 반려동물 목록 불러오기
    addPet: (petData: Omit<Pet, 'petId'>, image?: any) => Promise<void>; // 🆕 반려동물 추가
    editPet: (petId: number, petData: Partial<Pet>, petImage?: any) => Promise<void>; // ✏️ 반려동물 정보 수정
    removePet: (petId: number) => Promise<void>; // 🗑️ 반려동물 삭제
}

/** ✅ 기본 더미 데이터 (오류 방지) */
const defaultPets: Pet[] = [
    {
        petId: 999,
        name: '스토어 더미데이터 반려동물',
        type: 'DOG',
        birthDate: '2020-01-01',
        petImg: require('../assets/images/pets-3.gif'),
    },
];

/** ✅ Zustand 전역 상태 */
const petStore = create<PetStore>((set) => ({
    pets: defaultPets, // 🟢 초기 데이터 설정

    /**
     * ✅ 반려동물 목록 불러오기
     * - API 요청 후 Zustand 상태 업데이트
     */
    fetchPets: async () => {
        try {
            const petList = await getPetList(); // 🐶 API 호출

            if (petList.length > 0) {
                console.log('🐶✅ 가져온 반려동물 목록:', petList);
                set({ pets: petList });
            } else {
                console.warn('⚠️ 반려동물이 없어서 기본 데이터 설정됨.');
                set({ pets: defaultPets }); // ❗ 기본 데이터로 유지
            }
        } catch (error) {
            console.error('🐶❌ 반려동물 목록 불러오기 실패:', error);
            set({ pets: defaultPets }); // ❌ 오류 발생 시 기본 데이터 유지
        }
    },

    /**
     * ✅ 반려동물 추가
     * - API 요청 후 Zustand 상태 업데이트
     */
    addPet: async (petData, petImage) => {
        try {
            const newPet = await registerPet({
                name: petData.name,
                type: petData.type,
                birthDate: petData.birthDate,
                },
                petImage || '', // petImg 값이 없을 경우 빈 문자열로 처리
            );

            set((state) => ({ pets: [...state.pets, newPet] })); // ✅ 상태 업데이트
        } catch (error) {
            console.error('🐶❌ 반려동물 추가 실패:', error);
        }
    },

    /**
     * ✅ 반려동물 정보 수정
     * - API 요청 후 상태 업데이트
     */
    editPet: async (petId, petData, petImage) => {
        try {
            const updatedPet = await updatePet(petId, {
                name: petData.name,
                type: petData.type, // type을 breed로 변환하지 않도록 수정
                birthDate: petData.birthDate,
                },
                petImage || '', // petImg 값이 없을 경우 빈 문자열로 처리
            );

            set((state) => ({
                pets: state.pets.map((pet) => (pet.petId === petId ? updatedPet : pet)),
            }));
        } catch (error) {
            console.error('🐶❌ 반려동물 정보 수정 실패:', error);
        }
    },

    /**
     * ✅ 반려동물 삭제
     * - API 요청 후 상태 최신화
     */
    removePet: async (petId) => {
        try {
            await deletePet(petId);
            await petStore.getState().fetchPets(); // 삭제 후 상태 최신화 보장
        } catch (error) {
            console.error('🐶❌ 반려동물 삭제 실패:', error);
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

