// 📁 context/snackbarStore.ts
import {create} from 'zustand';

interface SnackbarState {
  visible: boolean;
  message: string;
  extra?: string; // 선택적 프로퍼티로 추가
  isBattle?: boolean;
  showSnackbar: (message: string, extra?: string, isBattle?: boolean) => void;
  hideSnackbar: () => void;
}

export const useSnackbarStore = create<SnackbarState>(set => ({
  visible: false,
  message: '',
  extra: undefined,
  isBattle: false,

  showSnackbar: (message, extra, isBattle) => {
    set({ visible: true, message, extra, isBattle });
    // 자동 사라짐 제거 (수동 닫기만 허용)
  },

  hideSnackbar: () => set({ visible: false, message: '', extra: undefined, isBattle: false }),
}));
