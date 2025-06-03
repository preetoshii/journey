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
export type NodeRole = "sun" | "moon";

// New GoalAction interface
export interface GoalAction {
  date: string;
  title: string;
  recap?: string;
}

export interface ZoomNode {
  id: string; // Unique node ID
  role: "sun" | "moon"; // Node type
  title: string; // Display title
  subtitle: string; // Display subtitle
  positions: Record<ZoomLevel, Position>; // Position for each zoom level
  color: string; // Node color
  progress?: number; // Optional progress value (0-100)
  recentActions?: GoalAction[]; // Use new GoalAction type
  growthNarrative?: {
    'last month'?: string;
    'last 6 months'?: string;
    'all time'?: string;
    [key: string]: string | undefined;
  };
} 