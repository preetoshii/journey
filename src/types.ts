/*
  types.ts
  -------------------
  This file defines shared data structure types and interfaces for the application,
  primarily focusing on the "content" or "domain" data like moons and goals.

  The main application state type (`JourneyModeStore`) is co-located with the store
  in `src/store/useJourneyModeStore.ts`.

  HOW TO USE:
  - Import types from this file for data objects like nodes and goals.
  - Update this file if the data contract for nodes or goals changes.

  WHAT IT HANDLES:
  - Position: A simple {x, y} coordinate type.
  - ZoomNode: The core data interface for a "moon".
  - Goal: The interface for a goal or task associated with a moon.
*/

// --- Position interface ---
export interface Position {
  x: number;
  y: number;
}

// --- ZoomNode interface ---
export interface ZoomNode {
  id: string;
  role: 'sun' | 'moon';
  title: string;
  subtitle: string;
  color: string;
  positions: Record<string, Position>;
  progress?: number;
  goals?: Goal[];
  growthNarrative?: Record<string, string>;
}

// --- Goal interface ---
export interface Goal {
  id: string;
  title: string;
  progress: number;
  completed: boolean;
  date?: string;
  recap?: string;
  status?: string;
  progressText?: string;
} 