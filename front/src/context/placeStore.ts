// 📁 context/placeStore.ts
import { create } from 'zustand';
import {
    createPlace,
    getPlaces,
    getPlaceById,
    updatePlace,
    deletePlace,
} from '../services/placeService';

// ✅ 즐겨찾는 장소 타입 정의
export interface Place {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
}

interface PlaceStore {
    places: Place[];
    selectedPlace: Place | null;

    fetchPlaces: () => Promise<void>;
    fetchPlaceById: (id: number) => Promise<void>;
    addPlace: (place: Omit<Place, 'id'>) => Promise<void>;
    editPlace: (id: number, data: Partial<Omit<Place, 'id'>>) => Promise<void>;
    removePlace: (id: number) => Promise<void>;
}

const placeStore = create<PlaceStore>((set) => ({
    places: [],
    selectedPlace: null,

    /** ✅ 전체 장소 목록 불러오기 */
    fetchPlaces: async () => {
        try {
            const data = await getPlaces();
            set({ places: data });
        } catch (error) {
            console.error('❌ [장소 목록 조회 실패]', error);
        }
    },

    /** ✅ 단일 장소 상세 조회 */
    fetchPlaceById: async (id) => {
        try {
            const data = await getPlaceById(id);
            set({ selectedPlace: data });
        } catch (error) {
            console.error(`❌ [장소 조회 실패] ID: ${id}`, error);
        }
    },

    /** ✅ 장소 등록 */
    addPlace: async (place) => {
        try {
            const newPlace = await createPlace(place);
            set((state) => ({ places: [...state.places, newPlace] }));
        } catch (error) {
            console.error('❌ [장소 등록 실패]', error);
        }
    },

    /** ✅ 장소 정보 수정 */
    editPlace: async (id, data) => {
        try {
            const updated = await updatePlace(id, data);
            set((state) => ({
                places: state.places.map((p) => (p.id === id ? updated : p)),
                selectedPlace: updated,
            }));
        } catch (error) {
            console.error('❌ [장소 수정 실패]', error);
        }
    },

    /** ✅ 장소 삭제 */
    removePlace: async (id) => {
        try {
            await deletePlace(id);
            set((state) => ({
                places: state.places.filter((p) => p.id !== id),
                selectedPlace: null,
            }));
        } catch (error) {
            console.error('❌ [장소 삭제 실패]', error);
        }
    },
}));

export default placeStore;
