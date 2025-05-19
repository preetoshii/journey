/*
  useZoomStore.ts
  -------------------
  This file defines the global zoom state for the ZoomWorld interface using Zustand.
  It manages the current zoom level, focused moon, and panning targets, and exposes actions for zooming and panning.

  HOW TO USE:
  - Import and use useZoomStore in any component to access or update zoom state.
  - All zooming, focusing, and panning state is managed here.

  WHAT IT HANDLES:
  - Current zoom level (level1, level2, etc.)
  - Focused moon (for snapping and highlighting)
  - Pan target (for imperative panning)
  - Actions for zooming in/out, setting level, and setting pan target
*/

import { create } from 'zustand';
import type { ZoomLevel, ZoomState, Position } from '../../types';
import { playSound } from './soundUtils';

/**
 * useZoomStore
 * Zustand store for managing zoom, focus, and panning state in ZoomWorld.
 * Exposes state and actions for use throughout the app.
 */
export const useZoomStore = create<ZoomState>((set) => ({
  currentLevel: "level1", // Initial zoom level
  focusedMoonId: null,    // No moon focused initially
  lastFocusedMoonId: null, // No last focused moon initially
  panTarget: null,        // No pan target initially
  
  /**
   * zoomIn
   * Zooms in to level2 and optionally focuses a moon.
   * If a moon is provided, sets it as focused and triggers panning.
   * If no moon is provided but there's a last focused moon, uses that.
   */
  zoomIn: (targetMoonId?: string) => set((state) => {
    if (state.currentLevel === "level1") {
      playSound('zoom-in.wav');
      const moonToFocus = targetMoonId || state.lastFocusedMoonId;
      return {
        currentLevel: "level2",
        focusedMoonId: moonToFocus || null,
        panTarget: moonToFocus ? { x: 0, y: 0 } : null
      };
    }
    return state;
  }),

  /**
   * zoomOut
   * Zooms out to level1 and clears focus/pan.
   * Stores the current focused moon as lastFocusedMoonId before clearing.
   */
  zoomOut: () => set((state) => {
    if (state.currentLevel === "level2") {
      playSound('zoom-out.wav');
      return {
        currentLevel: "level1",
        focusedMoonId: null,
        lastFocusedMoonId: state.focusedMoonId, // Store current focus before clearing
        panTarget: null
      };
    }
    return state;
  }),

  /**
   * setLevel
   * Sets the current zoom level and clears pan target.
   */
  setLevel: (level: ZoomLevel) => set({ 
    currentLevel: level,
    panTarget: null 
  }),

  /**
   * setPanTarget
   * Sets the pan target for imperative panning.
   */
  setPanTarget: (target: Position | null) => set({ panTarget: target })
})); 