import { create } from 'zustand';
import type { Accomplishment } from '../types/accomplishmentTypes'; // Correct for Accomplishment
import type { Goal, ZoomNode } from '../types';
import { nodes as initialNodes } from '../data/nodes';

/**
 * @typedef {('idle' | 'starsAppear' | 'starsPause' | 'starsFly' | 'progressBoost' | 'ending')} CutsceneStep
 * @description Represents the specific stage of the accomplishment cutscene animation, allowing components
 * to show different visuals and behaviors for each step of the sequence.
 */
export type CutsceneStep = 'idle' | 'starsAppear' | 'starsPause' | 'starsFly' | 'progressBoost' | 'ending';

/**
 * @interface JourneyModeStore
 * @description Defines the complete shape of the application's central state store, managed by Zustand.
 * This interface includes all state properties and the action functions that can be used to modify them.
 * It serves as the single source of truth for the entire application, ensuring that all components
 * share a consistent and predictable state.
 */
export interface JourneyModeStore {
  mode: 'overview' | 'detail' | 'meta';
  focusedMoonIndex: number; // 0 for sun/overview, 1-3 for moons in detail
  isDebugMode: boolean;
  scrollContainer: HTMLDivElement | null;
  isAutoScrolling: boolean;
  isScrollSnapEnabled: boolean;
  isClickToCenterEnabled: boolean;
  activeCardKey: string | null; // For DetailArea card highlighting
  isMoonHovered: boolean; // Added for Lottie visibility

  // Cutscene State
  isCutsceneActive: boolean;
  currentAccomplishments: Accomplishment[] | null;
  cutsceneStep: CutsceneStep;
  pendingGoalUpdates: Record<string, { progressBoost: number; newGoals: Goal[] }> | null;
  nodes: ZoomNode[]; // Add nodes to the store to manage their state, especially progress

  // Actions
  setMode: (mode: 'overview' | 'detail' | 'meta') => void;
  setFocusedMoonIndex: (index: number) => void;
  toggleDebugMode: () => void;
  setScrollContainer: (container: HTMLDivElement | null) => void;
  setIsAutoScrolling: (isScrolling: boolean) => void;
  toggleScrollSnap: () => void;
  toggleClickToCenter: () => void;
  setActiveCardKey: (key: string | null) => void;
  setIsMoonHovered: (isHovered: boolean) => void; // Added action
  
  // Cutscene Actions
  triggerCutscene: (accomplishments: Accomplishment[]) => void;
  _prepareCutsceneState: (accomplishments: Accomplishment[]) => void;
  _applyPendingChanges: () => void;
  _endCutscene: () => void;
  setCutsceneStep: (step: CutsceneStep) => void;
  updateNodeProgress: (nodeId: string, newProgress: number) => void; // Action to update progress

  pulseMoons: Record<string, boolean>;
  triggerMoonPulse: (moonId: string) => void;
  resetMoonPulse: (moonId: string) => void;

  isDebugSidebarOpen: boolean;
  closeDebugSidebar: () => void;
  toggleDebugSidebar: () => void;

  metaJourneyProgress: number;
  setMetaJourneyProgress: (progress: number) => void;
}

/**
 * useJourneyModeStore
 * -------------------
 * This is the central state management store for the entire application, implemented with Zustand.
 * It provides a single, unified object for state and actions that can be accessed by any component,
 * eliminating the need for complex prop drilling and making state management clear and predictable.
 *
 * The store is divided into several logical sections:
 * - **Initial State:** Default values for all state properties.
 * - **Action Implementations:** The concrete logic for each action defined in the `JourneyModeStore` interface.
 *   These are typically simple `set()` calls for straightforward state changes.
 * - **Cutscene Logic:** A more complex set of actions that manage the multi-step accomplishment cutscene.
 *   This logic is co-located here to keep the complex state transformations contained within the store itself,
 *   rather than scattered across components.
 */
export const useJourneyModeStore = create<JourneyModeStore>((set, get) => ({
  mode: 'overview',
  focusedMoonIndex: 0,
  isDebugMode: false,
  scrollContainer: null,
  isAutoScrolling: false,
  isScrollSnapEnabled: false,
  isClickToCenterEnabled: false,
  activeCardKey: null,
  isMoonHovered: false, // Initial state

  // Cutscene State Initial Values
  isCutsceneActive: false,
  currentAccomplishments: null,
  cutsceneStep: 'idle',
  pendingGoalUpdates: null,
  nodes: initialNodes, // Initialize nodes from the imported data

  pulseMoons: {},
  triggerMoonPulse: (moonId) => set(state => ({
    pulseMoons: { ...state.pulseMoons, [moonId]: true }
  })),
  resetMoonPulse: (moonId) => set(state => {
    const newPulseMoons = { ...state.pulseMoons };
    delete newPulseMoons[moonId];
    return { pulseMoons: newPulseMoons };
  }),

  // Action Implementations
  setMode: (mode) => set({ mode }),
  setFocusedMoonIndex: (index) => set({ focusedMoonIndex: index }),
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),
  setScrollContainer: (container) => set({ scrollContainer: container }),
  setIsAutoScrolling: (isScrolling) => set({ isAutoScrolling: isScrolling }),
  toggleScrollSnap: () => set((state) => ({ isScrollSnapEnabled: !state.isScrollSnapEnabled })),
  toggleClickToCenter: () => set((state) => ({ isClickToCenterEnabled: !state.isClickToCenterEnabled })),
  setActiveCardKey: (key) => set({ activeCardKey: key }),
  setIsMoonHovered: (isHovered) => set({ isMoonHovered: isHovered }), // Action implementation

  /**
   * Cutscene Logic
   * --------------
   * This collection of actions orchestrates the complex, multi-stage accomplishment cutscene. The logic
   * is centralized here to ensure that all state transitions are handled atomically and predictably.
   *
   * The typical flow is as follows:
   * 1. `triggerCutscene` is called from the UI with a list of accomplishments.
   * 2. It immediately calls `_prepareCutsceneState`. This internal function calculates `pendingGoalUpdates`
   *    (the total `progressBoost` and new goals for each moon). It also immediately merges the new goals
   *    and applies a small *visual reduction* in progress to the nodes to create an anticipation effect.
   * 3. `triggerCutscene` then sets `isCutsceneActive` to true and the `cutsceneStep` to 'starsAppear',
   *    which starts the visual animation sequence in the `AccomplishmentCutsceneOverlay` component.
   * 4. The overlay component, as it moves through its animations, calls `setCutsceneStep` to advance the state.
   * 5. When the animation reaches the 'progressBoost' step, `_applyPendingChanges` is called. This function
   *    applies the full `progressBoost` from `pendingGoalUpdates` to the nodes, causing the progress bars
   *    to animate to their new, higher values.
   * 6. Finally, `_endCutscene` is called to reset all cutscene-related state variables back to their
   *    default 'idle' values, concluding the sequence.
   */
  triggerCutscene: (accomplishments) => {
    get()._prepareCutsceneState(accomplishments);
    set({
      isCutsceneActive: true,
      cutsceneStep: 'starsAppear',
      currentAccomplishments: accomplishments,
    });
  },
  _prepareCutsceneState: (accomplishments) => {
    const newPendingGoalUpdates: Record<string, { progressBoost: number; newGoals: Goal[] }> = {};
    const currentNodes = get().nodes;

    accomplishments.forEach(acc => {
      acc.goals.forEach(goalMapping => {
        if (!newPendingGoalUpdates[goalMapping.goalId]) {
          newPendingGoalUpdates[goalMapping.goalId] = { progressBoost: 0, newGoals: [] };
        }
        newPendingGoalUpdates[goalMapping.goalId].progressBoost += goalMapping.innerWorkAmount;
        newPendingGoalUpdates[goalMapping.goalId].newGoals.push({
          id: `goal-${acc.id}-${goalMapping.goalId}`, // Create a unique goal ID
          title: acc.title,
          recap: acc.recap,
          progress: 100, // New goals from accomplishments are always complete
          completed: true, // Mark as completed
          date: new Date().toLocaleDateString(),
          status: 'completed',
        });
      });
    });

    const updatedNodes = currentNodes.map(node => {
      const tempNode = { ...node };
      if (newPendingGoalUpdates[tempNode.id]) {
        const currentProgress = tempNode.progress || 0;
        // Visually "borrow" from the progress bar for the boost animation
        const reduction = Math.min(currentProgress, Math.max(1, newPendingGoalUpdates[tempNode.id].progressBoost * 0.1));
        const newVisualProgress = Math.max(0, currentProgress - reduction);
        tempNode.progress = newVisualProgress;

        // Immediately add new goals to the node's list
        const originalNode = initialNodes.find(rn => rn.id === tempNode.id);
        const existingGoals = originalNode?.goals || [];
        tempNode.goals = [...existingGoals, ...newPendingGoalUpdates[tempNode.id].newGoals];
      }
      return tempNode;
    });

    set({ pendingGoalUpdates: newPendingGoalUpdates, nodes: updatedNodes });
  },
  _applyPendingChanges: () => {
    const { pendingGoalUpdates, nodes } = get();
    if (!pendingGoalUpdates) {
      return;
    }

    const updatedNodes = nodes.map(node => {
      if (pendingGoalUpdates[node.id]) {
        const currentProgress = node.progress || 0;
        const boost = pendingGoalUpdates[node.id].progressBoost;
        return {
          ...node,
          progress: Math.min(100, currentProgress + boost)
        };
      }
      return node;
    });

    set({ nodes: updatedNodes, pendingGoalUpdates: null });
  },
  _endCutscene: () => {
    set({
      isCutsceneActive: false,
      currentAccomplishments: null,
      cutsceneStep: 'idle',
      pendingGoalUpdates: null,
    });
  },
  setCutsceneStep: (step) => set({ cutsceneStep: step }),

  updateNodeProgress: (nodeId, newProgress) => {
    set((state) => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId ? { ...node, progress: newProgress } : node
      ),
    }));
  },

  isDebugSidebarOpen: false,
  closeDebugSidebar: () => set({ isDebugSidebarOpen: false }),
  toggleDebugSidebar: () => set((state) => ({ isDebugSidebarOpen: !state.isDebugSidebarOpen })),

  metaJourneyProgress: 0.5,
  setMetaJourneyProgress: (progress) => set({ metaJourneyProgress: progress }),
})); 