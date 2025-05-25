// 📁 context/snackbarStore.ts
import {create} from 'zustand';

interface SnackbarState {
  visible: boolean;
  message: string;
  showSnackbar: (msg: string) => void;
  hideSnackbar: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  visible: false,
  message: '',
  showSnackbar: (msg) => {
    set({message: msg, visible: true});
  },
  hideSnackbar: () => set({visible: false}),
}));

