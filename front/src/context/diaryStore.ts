// 📁 context/diaryStore.ts
import {create} from 'zustand';
import {
  createAIDiary,
  fetchMyDiaries,
  fetchDiaryDetail,
  deleteDiary,
} from '../services/diaryService';

interface Diary {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

interface DiaryState {
  diaries: Diary[];
  selectedDiary: Diary | null;
  loading: boolean;
  error: string | null;

  loadMyDiaries: () => Promise<void>;
  loadDiaryDetail: (diaryId: number) => Promise<void>;
  createDiary: (title: string, content: string) => Promise<void>;
  removeDiary: (diaryId: number) => Promise<void>;
}

export const useDiaryStore = create<DiaryState>((set) => ({
  diaries: [],
  selectedDiary: null,
  loading: false,
  error: null,

  /** ✅ 전체 일기 불러오기 */
  loadMyDiaries: async () => {
    set({loading: true, error: null});
    try {
      const res = await fetchMyDiaries();
      set({diaries: res.data, loading: false});
    } catch (e: any) {
      set({error: e.message || '일기 불러오기 실패', loading: false});
    }
  },

  /** ✅ 특정 일기 상세 조회 */
  loadDiaryDetail: async (diaryId: number) => {
    set({loading: true, error: null});
    try {
      const res = await fetchDiaryDetail(diaryId);
      set({selectedDiary: res.data, loading: false});
    } catch (e: any) {
      set({error: e.message || '일기 상세 조회 실패', loading: false});
    }
  },

  /** ✅ 일기 생성 */
  createDiary: async (title: string, content: string) => {
    set({loading: true, error: null});
    try {
      const res = await createAIDiary(title, content);
      set((state) => ({
        diaries: [res.data, ...state.diaries],
        loading: false,
      }));
    } catch (e: any) {
      set({error: e.message || '일기 생성 실패', loading: false});
    }
  },

  /** ✅ 일기 삭제 */
  removeDiary: async (diaryId: number) => {
    set({loading: true, error: null});
    try {
      await deleteDiary(diaryId);
      set((state) => ({
        diaries: state.diaries.filter((d) => d.id !== diaryId),
        loading: false,
      }));
    } catch (e: any) {
      set({error: e.message || '일기 삭제 실패', loading: false});
    }
  },
}));
