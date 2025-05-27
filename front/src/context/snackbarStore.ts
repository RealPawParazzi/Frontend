// 📁 context/snackbarStore.ts
import {create} from 'zustand';

interface SnackbarState {
  visible: boolean;
  message: string;
  extra?: string; // 선택적 프로퍼티로 추가
  showSnackbar: (message: string, duration?: number) => void;
  hideSnackbar: () => void;
}

export const useSnackbarStore = create<SnackbarState>(set => ({
  visible: false,
  message: '',
  extra: undefined, // 초기값 설정

  showSnackbar: (message, duration = 3000) => {
    set({visible: true, message});
    setTimeout(() => set({visible: false, message: ''}), duration);
  },

  hideSnackbar: () => set({visible: false, message: ''}),
}));
