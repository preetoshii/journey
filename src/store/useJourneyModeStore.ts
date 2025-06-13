import { create } from 'zustand';
import type { Accomplishment } from '../types/accomplishmentTypes'; // Correct for Accomplishment
import type { Goal } from '../types'; // Corrected import for Goal
// Assuming ZoomNode is also needed for _prepareCutsceneState logic later, ensure it's imported if not already
import type { ZoomNode } from '../types'; 
// And the nodes data itself, assuming it's accessible or part of the store for progress updates
import { nodes as rawNodes } from '../components/Moon/MoonVisualizer'; // Assuming this is the source of truth for now

/**
 * @typedef {('idle' | 'starsAppear' | 'starsPause' | 'starsFly' | 'progressBoost' | 'ending')} CutsceneStep
 * @description Represents the specific stage of the accomplishment cutscene animation, allowing components
 * to show different visuals and behaviors for each step of the sequence.
 */
export type CutsceneStep = 'idle' | 'starsAppear' | 'starsPause' | 'starsFly' | 'progressBoost' | 'ending';

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

  // Cutscene State
  isCutsceneActive: boolean;
  currentAccomplishments: Accomplishment[] | null;
  cutsceneStep: CutsceneStep;
  pendingGoalUpdates: Record<string, { progressBoost: number; newGoals: Goal[] }> | null;
  nodes: ZoomNode[]; // Add nodes to the store to manage their state, especially progress

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
  
  // Cutscene Actions
  triggerCutscene: (accomplishments: Accomplishment[]) => void;
  _prepareCutsceneState: (accomplishments: Accomplishment[]) => void;
  _applyPendingChanges: () => void;
  _endCutscene: () => void;
  setCutsceneStep: (step: CutsceneStep) => void;
  updateNodeProgress: (nodeId: string, newProgress: number) => void; // Action to update progress

  isDebugSidebarOpen: boolean;
  openDebugSidebar: () => void;
  closeDebugSidebar: () => void;
  toggleDebugSidebar: () => void;
}

/**
 * @interface JourneyModeStore
 * @description Defines the complete shape of the application's central state store, managed by Zustand.
 * This interface includes all state properties and the action functions that can be used to modify them.
 * It serves as the single source of truth for the entire application, ensuring that all components
 * share a consistent and predictable state.
 */
export interface JourneyModeStore {
  mode: 'overview' | 'detail';
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
  setMode: (mode: 'overview' | 'detail') => void;
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
  nodes: rawNodes, // Initialize nodes from the imported data

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
   * 2. It immediately calls `_prepareCutsceneState`. This internal function calculates the total `progressBoost`
   *    for each affected moon and creates a `pendingGoalUpdates` object. It also immediately merges the new
   *    goal text into the `nodes` data so the UI can display them.
   * 3. `triggerCutscene` then sets `isCutsceneActive` to true and the `cutsceneStep` to 'starsAppear',
   *    which starts the visual animation sequence in the `AccomplishmentCutsceneOverlay` component.
   * 4. The overlay component, as it moves through its animations, calls `setCutsceneStep` to advance the state.
   * 5. When the animation reaches the 'progressBoost' step, the `_applyPendingChanges` action is called. This
   *    function takes the `progressBoost` values from `pendingGoalUpdates` and applies them to the `nodes`,
   *    causing the `ArcProgressBar` components to animate to their new, higher progress values.
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
    console.log('[Cutscene] Triggered with:', accomplishments);
  },
  _prepareCutsceneState: (accomplishments) => {
    console.log('[Cutscene] Preparing state for accomplishments:', accomplishments);
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
      let tempNode = { ...node };
      if (newPendingGoalUpdates[tempNode.id]) {
        const currentProgress = tempNode.progress || 0;
        const reduction = Math.min(currentProgress, Math.max(1, newPendingGoalUpdates[tempNode.id].progressBoost * 0.1));
        const newVisualProgress = Math.max(0, currentProgress - reduction);
        console.warn(`[Cutscene] Visually reducing progress for ${tempNode.id} from ${currentProgress} to ${newVisualProgress}. Boost is ${newPendingGoalUpdates[tempNode.id].progressBoost}`);
        tempNode.progress = newVisualProgress;

        const originalNode = rawNodes.find(rn => rn.id === tempNode.id);
        const existingGoals = originalNode?.goals || [];
        tempNode.goals = [...existingGoals, ...newPendingGoalUpdates[tempNode.id].newGoals];
        console.log(`[Cutscene] Immediately adding new goals to ${tempNode.id}. Total goals: ${tempNode.goals.length}`);
      }
      return tempNode;
    });

    set({ pendingGoalUpdates: newPendingGoalUpdates, nodes: updatedNodes });
    console.log('[Cutscene] Pending goal updates calculated (goals merged immediately):', newPendingGoalUpdates);
    console.log('[Cutscene] Nodes after immediate goal merge:', get().nodes);
    updatedNodes.forEach(node => {
      if (newPendingGoalUpdates[node.id]) {
        console.log(`[Cutscene] Goals for ${node.id}:`, node.goals);
      }
    });
  },
  _applyPendingChanges: () => {
    console.log('[Cutscene] Applying pending progress changes...');
    const { pendingGoalUpdates, nodes } = get();
    if (!pendingGoalUpdates) {
      console.log('[Cutscene] No pending updates to apply.');
      return;
    }

    const finalNodes = nodes.map(node => {
      if (pendingGoalUpdates[node.id]) {
        // Recalculate original progress to correctly apply the boost.
        // This assumes 'node.progress' is currently the visually reduced progress.
        let originalProgress = 0;
        const originalNodeFromRaw = rawNodes.find(rn => rn.id === node.id);
        if (originalNodeFromRaw) {
          originalProgress = originalNodeFromRaw.progress || 0;
        } else {
          // Fallback if node not in rawNodes (should not happen with current setup)
          // or if we want to be super safe, we could try to reverse the reduction
          // but referencing original rawNodes is safer.
          console.warn(`[Cutscene] Original node ${node.id} not found in rawNodes for progress calculation. Using current visually reduced progress as base for boost.`);
          originalProgress = node.progress || 0; // This will be the visually reduced one
        }
        
        const newFinalProgress = Math.min(100, originalProgress + pendingGoalUpdates[node.id].progressBoost);
        
        console.log(`[Cutscene] Applying progress to ${node.id}: original progress ${originalProgress}, boost ${pendingGoalUpdates[node.id].progressBoost}, new final progress ${newFinalProgress}. Current visual progress was ${node.progress}`);
        // newGoals are already merged in _prepareCutsceneState, so only update progress.
        // Ensure goals from the node (which already has new ones) is preserved.
        return { ...node, progress: newFinalProgress, goals: node.goals };
      }
      return node;
    });
    set({ pendingGoalUpdates: null, nodes: finalNodes });
    console.log("[Cutscene] Final node states after applying progress changes:", get().nodes);
  },
  _endCutscene: () => {
    console.log('[Cutscene] Ending cutscene.');
    // Potentially refresh nodes from original source if they were only shallow copied for cutscene
    // For now, assume `_applyPendingChanges` correctly sets the final state.
    set({
      isCutsceneActive: false,
      cutsceneStep: 'idle',
      currentAccomplishments: null,
    });
    // TODO: Restore scroll
  },
  setCutsceneStep: (step) => set({ cutsceneStep: step }),
  updateNodeProgress: (nodeId, newProgress) => {
    set(state => ({
      nodes: state.nodes.map(node => 
        node.id === nodeId ? { ...node, progress: Math.min(100, Math.max(0, newProgress)) } : node
      )
    }));
  },

  isDebugSidebarOpen: false,
  closeDebugSidebar: () => set({ isDebugSidebarOpen: false }),
  toggleDebugSidebar: () => set((state) => ({ isDebugSidebarOpen: !state.isDebugSidebarOpen })),
})); 