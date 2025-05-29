import { create } from 'zustand';

interface JourneyModeState {
  mode: 'overview' | 'detail';
  setMode: (mode: 'overview' | 'detail') => void;
  focusedMoonIndex: number; // 0 for none, 1-3 for specific moons
  setFocusedMoonIndex: (index: number) => void;
  isDebugMode: boolean;
  toggleDebugMode: () => void;
  scrollContainer: HTMLDivElement | null; // To store the main scroll container element
  setScrollContainer: (container: HTMLDivElement | null) => void;
  isAutoScrolling: boolean; // True if programmatic scroll is in progress
  setIsAutoScrolling: (isScrolling: boolean) => void;
  activeCardKey: string | null; // Key of the currently focused card (e.g., 'moon1-progress')
  setActiveCardKey: (key: string | null) => void;
  isScrollSnapEnabled: boolean; // To enable/disable scroll snapping
  toggleScrollSnap: () => void;
}

export const useJourneyModeStore = create<JourneyModeState>((set) => ({
  mode: 'overview',
  setMode: (mode) => set(() => ({ mode })),
  focusedMoonIndex: 0, // Default to no moon focused
  setFocusedMoonIndex: (index) => set(() => ({ focusedMoonIndex: index })),
  isDebugMode: false,
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),
  scrollContainer: null, // Default to null
  setScrollContainer: (container) => set(() => ({ scrollContainer: container })),
  isAutoScrolling: false, // Default to false
  setIsAutoScrolling: (isScrolling) => set(() => ({ isAutoScrolling: isScrolling })),
  activeCardKey: null, // Default to no card active
  setActiveCardKey: (key) => set(() => ({ activeCardKey: key })),
  isScrollSnapEnabled: false, // Default to false (snap scrolling is off)
  toggleScrollSnap: () => set((state) => ({ isScrollSnapEnabled: !state.isScrollSnapEnabled }))
})); 