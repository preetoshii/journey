import { create } from 'zustand';

export interface JourneyModeState {
  mode: 'overview' | 'detail';
  focusedMoonIndex: number; // 0 for sun/overview, 1-3 for moons in detail
  isDebugMode: boolean;
  scrollContainer: HTMLDivElement | null;
  isAutoScrolling: boolean;
  isScrollSnapEnabled: boolean;
  isClickToCenterEnabled: boolean;
  activeCardKey: string | null; // For DetailArea card highlighting
  isMoonHovered: boolean; // Added for Lottie visibility

  // Actions
  setMode: (mode: 'overview' | 'detail') => void;
  setFocusedMoonIndex: (index: number) => void;
  toggleDebugMode: () => void;
  setScrollContainer: (container: HTMLDivElement | null) => void;
  setIsAutoScrolling: (isScrolling: boolean) => void;
  toggleScrollSnap: () => void;
  toggleClickToCenter: () => void;
  setActiveCardKey: (key: string | null) => void;
  setIsMoonHovered: (isHovered: boolean) => void; // Added action
}

export const useJourneyModeStore = create<JourneyModeState>((set, get) => ({
  mode: 'overview',
  focusedMoonIndex: 0,
  isDebugMode: false,
  scrollContainer: null,
  isAutoScrolling: false,
  isScrollSnapEnabled: true,
  isClickToCenterEnabled: false,
  activeCardKey: null,
  isMoonHovered: false, // Initial state

  setMode: (mode) => set({ mode }),
  setFocusedMoonIndex: (index) => set({ focusedMoonIndex: index }),
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),
  setScrollContainer: (container) => set({ scrollContainer: container }),
  setIsAutoScrolling: (isScrolling) => set({ isAutoScrolling: isScrolling }),
  toggleScrollSnap: () => set((state) => ({ isScrollSnapEnabled: !state.isScrollSnapEnabled })),
  toggleClickToCenter: () => set((state) => ({ isClickToCenterEnabled: !state.isClickToCenterEnabled })),
  setActiveCardKey: (key) => set({ activeCardKey: key }),
  setIsMoonHovered: (isHovered) => set({ isMoonHovered: isHovered }), // Action implementation
})); 