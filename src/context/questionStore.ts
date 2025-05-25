// 📁questionStore.ts


import { create } from 'zustand';
import {
  createInquiry,
  fetchMyInquiries,
  fetchInquiryDetail,
  deleteInquiry,
} from '../services/questionService';

/** ✅ 문의 요약 데이터 타입 */
export interface InquirySummary {
  id: number;
  title: string;
  answered: boolean;
  createdAt: string;
}

/** ✅ 문의 상세 데이터 타입 */
export interface InquiryDetail extends InquirySummary {
  content: string;
  answer: string | null;
}

/** ✅ 상태 및 액션 정의 */
interface QuestionStore {
  // 📌 전체 문의 목록
  inquiries: InquirySummary[];

  // 📌 선택한 문의 상세
  selectedInquiry: InquiryDetail | null;

  // 📌 로딩 및 에러 상태
  isLoading: boolean;
  error: string | null;

  // ✅ 문의 등록
  submitInquiry: (title: string, content: string) => Promise<void>;

  // ✅ 내 문의 목록 불러오기
  loadMyInquiries: () => Promise<void>;

  // ✅ 문의 상세 조회
  loadInquiryDetail: (id: number) => Promise<void>;

  // ✅ 문의 삭제
  removeInquiry: (id: number) => Promise<void>;

  // ✅ 선택된 상세 초기화
  clearSelectedInquiry: () => void;
}

const useQuestionStore = create<QuestionStore>((set, get) => ({
  inquiries: [],
  selectedInquiry: null,
  isLoading: false,
  error: null,

  /** ✅ 1. 문의 등록 */
  submitInquiry: async (title, content) => {
    try {
      set({ isLoading: true, error: null });
      await createInquiry(title, content);
    } catch (err: any) {
      console.error('문의 등록 실패:', err);
      set({ error: err.message || '문의 등록 실패' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** ✅ 2. 내 문의 목록 불러오기 */
  loadMyInquiries: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await fetchMyInquiries();
      set({ inquiries: data });
    } catch (err: any) {
      console.error('문의 목록 불러오기 실패:', err);
      set({ error: err.message || '문의 목록 조회 실패' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** ✅ 3. 문의 상세 불러오기 */
  loadInquiryDetail: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await fetchInquiryDetail(id);
      set({ selectedInquiry: data });
    } catch (err: any) {
      console.error('문의 상세 조회 실패:', err);
      set({ error: err.message || '문의 상세 조회 실패' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** ✅ 4. 문의 삭제 */
  removeInquiry: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await deleteInquiry(id);
      set((state) => ({
        inquiries: state.inquiries.filter((q) => q.id !== id),
      }));
    } catch (err: any) {
      console.error('문의 삭제 실패:', err);
      set({ error: err.message || '문의 삭제 실패' });
    } finally {
      set({ isLoading: false });
    }
  },

  /** ✅ 5. 선택된 상세 초기화 */
  clearSelectedInquiry: () => set({ selectedInquiry: null }),
}));

export default useQuestionStore;
