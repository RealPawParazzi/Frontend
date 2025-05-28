// 📁 context/snackbarStore.ts
import {create} from 'zustand';

interface SnackbarState {
  visible: boolean;
  message: string;
  extra?: string; // 선택적 프로퍼티로 추가
  isBattle?: boolean;
  showSnackbar: (message: string, extra?: string, isBattle?: boolean) => void;
  hideSnackbar: () => void;
  logs: { message: string; extra?: string, isBattle?: boolean; }[]; // 로그 배열 추가
}

export const useSnackbarStore = create<SnackbarState>(set => ({
  visible: false,
  message: '',
  extra: undefined,
  isBattle: false,
  logs: [], // 초기값으로 빈 배열 설정

  showSnackbar: (message, extra, isBattle) => {
    set({ visible: true, message, extra, isBattle });
    // 로그 추가
    set(state => ({
      logs: [...state.logs, { message, extra, isBattle }],
    }));
    // 자동 사라짐 제거 (수동 닫기만 허용)
  },

  hideSnackbar: () => set({ visible: false, message: '', extra: undefined, isBattle: false }),
}));
