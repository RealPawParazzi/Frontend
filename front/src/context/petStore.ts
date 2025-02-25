import { create } from 'zustand';
import { getPetList, registerPet, updatePet, deletePet } from '../services/petService';

/** ✅ 반려동물 데이터 타입 */
interface Pet {
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
        name: '기본 반려동물',
        type: '강아지',
        birthDate: '2020-01-01',
        petImg: require('../assets/images/pets-3.gif'),
    },
];

/** ✅ Zustand 전역 상태 */
const usePetStore = create<PetStore>((set) => ({
    pets: defaultPets, // 🟢 기본값 설정

    /** ✅ 반려동물 목록 불러오기 */
    fetchPets: async (userId) => {
        try {
            const petList = await getPetList(userId);
            set({ pets: petList.length ? petList : defaultPets }); // 🟢 데이터 없을 경우 기본값 유지
        } catch (error) {
            console.error('🐶❌ 반려동물 목록 불러오기 실패:', error);
            set({ pets: defaultPets }); // 🟢 오류 발생 시 기본 데이터 유지
        }
    },

    /** ✅ 반려동물 추가 */
    addPet: async (userId, petData) => {
        try {
            const newPet = await registerPet(userId, {
                name: petData.name,
                breed: petData.type, // ✅ API 요구 사항: type → breed 변환
                age: new Date().getFullYear() - new Date(petData.birthDate).getFullYear(), // ✅ birthDate → age 변환
                profileImageUrl: petData.petImg, // ✅ 프로필 이미지 반영
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

export default usePetStore;
