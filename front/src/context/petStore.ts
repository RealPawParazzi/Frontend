import { create } from 'zustand';
import { getPetList, registerPet, updatePet, deletePet } from '../services/petService';

/** ✅ 반려동물 데이터 타입 */
export interface Pet {
    petId: number;
    name: string;
    type: string; // ✅ 기존 type을 유지 (API에서 breed로 변환)
    birthDate: string; // ✅ birthDate (API에서 age로 변환)
    petImg?: string;
}

/** ✅ Zustand 상태 타입 */
interface PetStore {
    pets: Pet[];
    fetchPets: (userId: number) => Promise<void>;
    addPet: (userId: number, petData: Omit<Pet, 'petId'>) => Promise<void>;
    editPet: (petId: number, petData: Partial<Pet>) => Promise<void>;
    removePet: (petId: number) => Promise<void>;
}

/** ✅ 기본 더미 데이터 (오류 방지) */
const defaultPets: Pet[] = [
    {
        petId: 999,
        name: '스토어 더미데이터 반려동물',
        type: '강아지',
        birthDate: '2020-01-01',
        petImg: require('../assets/images/pets-3.gif'),
    },
];

/** ✅ Zustand 전역 상태 */
const petStore = create<PetStore>((set) => ({
    pets: defaultPets, // 🟢 기본값 설정

    /** ✅ 반려동물 목록 불러오기 */
    fetchPets: async () => {
        try {
            const petList = await getPetList();

            if (petList.length > 0) {
                console.log('🐶✅ 가져온 반려동물 목록:', petList); // ✅ 성공한 데이터 확인
                set({ pets: petList }); // ✅ 정상적인 데이터가 있을 경우 업데이트
            } else {
                console.warn('⚠️ 반려동물이 없어서 기본 데이터 설정됨.');
                set({ pets: defaultPets }); // ✅ 게시글이 없을 경우 기본 데이터 설정
            }

            set({ pets: petList.length ? petList : defaultPets }); // ✅ 데이터 없으면 기본값 유지
        } catch (error) {
            console.error('🐶❌ 반려동물 목록 불러오기 실패:', error);
            set({ pets: defaultPets }); // 🟢 오류 발생 시 기본 데이터 유지
        }
    },

    /** ✅ 반려동물 추가 */
    addPet: async (userId, petData) => {
        try {
            const newPet = await registerPet({
                name: petData.name,
                type: petData.type, // ✅ API 요구 사항: type → breed 변환
                birthDate: petData.birthDate, // ✅ birthDate → age 변환
                petImg: petData.petImg, // ✅ 프로필 이미지 반영
            });

            set((state) => ({ pets: [...state.pets, newPet] }));
        } catch (error) {
            console.error('🐶❌ 반려동물 추가 실패:', error);
        }
    },

    /** ✅ 반려동물 정보 수정 */
    editPet: async (petId, petData) => {
        try {
            const updatedPet = await updatePet(petId, {
                name: petData.name,
                breed: petData.type, // ✅ type → breed 변환
                age: petData.birthDate ? new Date().getFullYear() - new Date(petData.birthDate).getFullYear() : undefined, // ✅ birthDate → age 변환
                profileImageUrl: petData.petImg,
            });

            set((state) => ({
                pets: state.pets.map((pet) => (pet.petId === petId ? updatedPet : pet)),
            }));
        } catch (error) {
            console.error('🐶❌ 반려동물 정보 수정 실패:', error);
        }
    },

    /** ✅ 반려동물 삭제 */
    removePet: async (petId) => {
        try {
            await deletePet(petId);
            set((state) => ({ pets: state.pets.filter((pet) => pet.petId !== petId) }));
        } catch (error) {
            console.error('🐶❌ 반려동물 삭제 실패:', error);
        }
    },

}));

/** ✅ 반려동물 전체 데이터 불러오기 */
export const loadPetData = async (userId: number) => {
    try {
        await petStore.getState().fetchPets(userId);
    } catch (error) {
        console.error('🐾❌ loadPetData 실패:', error);
    }
};

export default petStore;

