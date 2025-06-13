/*
  types.ts
  -------------------
  This file defines all shared types and interfaces for the application.
  It is the single source of truth for node and state types.

  HOW TO USE:
  - Import types from this file wherever you need to type nodes or state.
  - Update this file if you add new node types or state fields.

  WHAT IT HANDLES:
  - Position interface
  - ZoomNode interface (for sun/moon nodes)
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