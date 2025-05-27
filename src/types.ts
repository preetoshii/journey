/*
  types.ts
  -------------------
  This file defines all shared types and interfaces for the ZoomWorld system.
  It is the single source of truth for node, position, and zoom state types.

  HOW TO USE:
  - Import types from this file wherever you need to type zoom nodes, state, or positions.
  - Update this file if you add new node types, zoom levels, or state fields.

  WHAT IT HANDLES:
  - Zoom level enum
  - Position interface
  - ZoomNode interface (for sun/moon nodes)
  - ZoomState interface (for Zustand store)
*/

// --- Zoom level enum ---
export type ZoomLevel = "level1" | "level2" | "level3";

// --- Position in 2D space ---
export interface Position {
  x: number; // X coordinate
  y: number; // Y coordinate
}

// --- Node (sun or moon) in the zoom world ---
export interface ZoomNode {
  id: string; // Unique node ID
  role: "sun" | "moon"; // Node type
  title: string; // Display title
  subtitle: string; // Display subtitle
  positions: Record<ZoomLevel, Position>; // Position for each zoom level
  color: string; // Node color
  progress?: number; // Optional progress value (0-100)
  recentActions?: string[]; // Optional: recent actions for moons
}

// --- Zustand store state for zoom world ---
export interface ZoomState {
  currentLevel: ZoomLevel; // Current zoom level
  focusedMoonId: string | null; // ID of focused moon (if any)
  lastFocusedMoonId: string | null; // ID of the last focused moon
  panTarget: Position | null; // Target position for imperative panning
  zoomIn: (targetMoonId?: string) => void; // Action: zoom in
  zoomOut: () => void; // Action: zoom out
  setLevel: (level: ZoomLevel) => void; // Action: set zoom level
  setPanTarget: (target: Position | null) => void; // Action: set pan target
} 