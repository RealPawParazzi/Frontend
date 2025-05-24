// 📁 context/searchStore.ts
import { create } from 'zustand';

const useSearchStore = create<{
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  openSearchBar: boolean;
  setOpenSearchBar: (open: boolean) => void;
}>(set => ({
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  openSearchBar: false,
  setOpenSearchBar: (open) => set({ openSearchBar: open }),
}));

export default useSearchStore;
