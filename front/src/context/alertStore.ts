import { create } from 'zustand';

interface AlertState {
  message: string | null;
  visible: boolean;
  showAlert: (message: string) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  message: null,
  visible: false,
  showAlert: (message) => {
    set({ message, visible: true });
    setTimeout(() => set({ visible: false }), 3000); // 3초 후 자동 사라짐
  },
  hideAlert: () => set({ visible: false }),
}));
