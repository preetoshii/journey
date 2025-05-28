import { create } from 'zustand';

interface JourneyModeState {
  mode: 'overview' | 'detail';
  setMode: (mode: 'overview' | 'detail') => void;
}

export const useJourneyModeStore = create<JourneyModeState>((set) => ({
  mode: 'overview',
  setMode: (mode) => set(() => ({ mode })),
})); 