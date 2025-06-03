import { create } from 'zustand';
import type { Accomplishment } from '../types/accomplishmentTypes'; // Correct for Accomplishment
import type { GoalAction } from '../types'; // Corrected import for GoalAction
// Assuming ZoomNode is also needed for _prepareCutsceneState logic later, ensure it's imported if not already
import type { ZoomNode } from '../types'; 
// And the nodes data itself, assuming it's accessible or part of the store for progress updates
import { nodes as rawNodes } from '../components/Moon/MoonVisualizer'; // Assuming this is the source of truth for now

// Define the CutsceneStep union type
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
  currentAnimatingAccomplishmentIndex: number;
  pendingGoalUpdates: Record<string, { progressBoost: number; newActions: GoalAction[] }> | null;
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
  setCurrentAnimatingAccomplishmentIndex: (index: number) => void;
  updateNodeProgress: (nodeId: string, newProgress: number) => void; // Action to update progress
}

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
  currentAnimatingAccomplishmentIndex: number;
  pendingGoalUpdates: Record<string, { progressBoost: number; newActions: GoalAction[] }> | null;
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
  setCurrentAnimatingAccomplishmentIndex: (index: number) => void;
  updateNodeProgress: (nodeId: string, newProgress: number) => void; // Action to update progress

  pulseMoons: Record<string, boolean>;
  triggerMoonPulse: (moonId: string) => void;
  resetMoonPulse: (moonId: string) => void;
}

export const useJourneyModeStore = create<JourneyModeStore>((set, get) => ({
  mode: 'overview',
  focusedMoonIndex: 0,
  isDebugMode: false,
  scrollContainer: null,
  isAutoScrolling: false,
  isScrollSnapEnabled: true,
  isClickToCenterEnabled: false,
  activeCardKey: null,
  isMoonHovered: false, // Initial state

  // Cutscene State Initial Values
  isCutsceneActive: false,
  currentAccomplishments: null,
  cutsceneStep: 'idle',
  currentAnimatingAccomplishmentIndex: -1,
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

  // Cutscene Action Implementations (initial, _prepareCutsceneState will be more detailed later)
  triggerCutscene: (accomplishments) => {
    get()._prepareCutsceneState(accomplishments);
    set({
      isCutsceneActive: true,
      cutsceneStep: 'starsAppear',
      currentAnimatingAccomplishmentIndex: 0,
      currentAccomplishments: accomplishments,
    });
    console.log('[Cutscene] Triggered with:', accomplishments);
  },
  _prepareCutsceneState: (accomplishments) => {
    console.log('[Cutscene] Preparing state for accomplishments:', accomplishments);
    const newPendingGoalUpdates: Record<string, { progressBoost: number; newActions: GoalAction[] }> = {};
    const currentNodes = get().nodes;
    let visualProgressUpdates: Array<{ nodeId: string; newVisualProgress: number }> = [];

    accomplishments.forEach(acc => {
      acc.goals.forEach(goalMapping => {
        if (!newPendingGoalUpdates[goalMapping.goalId]) {
          newPendingGoalUpdates[goalMapping.goalId] = { progressBoost: 0, newActions: [] };
        }
        newPendingGoalUpdates[goalMapping.goalId].progressBoost += goalMapping.innerWorkAmount;
        newPendingGoalUpdates[goalMapping.goalId].newActions.push({
          id: `acc_${acc.id}_${goalMapping.goalId}`,
          type: 'accomplishment',
          date: new Date().toLocaleDateString(), // Placeholder date
          title: acc.title,
          recap: acc.recap,
        });
      });
    });

    // Placeholder for visually reducing progress bars
    // This currently modifies the actual progress in the store's copy of nodes.
    // We'll need a more robust way if this direct modification isn't desired for the "real" data yet.
    const updatedNodes = currentNodes.map(node => {
      if (newPendingGoalUpdates[node.id]) {
        const currentProgress = node.progress || 0;
        // Example: reduce by 10% of the boost, or a fixed small amount like 5, ensure not < 0
        const reduction = Math.min(currentProgress, Math.max(1, newPendingGoalUpdates[node.id].progressBoost * 0.1)); 
        const newVisualProgress = Math.max(0, currentProgress - reduction);
        console.warn(`[Cutscene] Visually reducing progress for ${node.id} from ${currentProgress} to ${newVisualProgress} (temporary for cutscene). Boost is ${newPendingGoalUpdates[node.id].progressBoost}`);
        visualProgressUpdates.push({ nodeId: node.id, newVisualProgress });
        return { ...node, progress: newVisualProgress };
      }
      return node;
    });

    set({ pendingGoalUpdates: newPendingGoalUpdates, nodes: updatedNodes });
    console.log('[Cutscene] Pending goal updates calculated:', newPendingGoalUpdates);
  },
  _applyPendingChanges: () => {
    console.log('[Cutscene] Applying pending changes...');
    const { pendingGoalUpdates, nodes } = get();
    if (!pendingGoalUpdates) return;

    const finalNodes = nodes.map(node => {
      if (pendingGoalUpdates[node.id]) {
        const currentProgress = node.progress || 0; // This is the visually reduced progress
        // To get original progress before visual reduction, we'd need to store it or recalculate the reduction.
        // For now, let's assume we add the full boost to the visually reduced value.
        // This means the initial visual reduction logic needs to be precise based on how final progress is calculated.
        // A better way: Store original progress, apply full boost to original for final value.
        // Let's adjust _prepareCutsceneState to be smarter or simplify for now.
        // For now, assuming node.progress is the *visually reduced* one.
        // The boost was calculated on the *original* progress.
        // To fix: _prepareCutsceneState should store original progress if it modifies it directly.
        // TEMPORARY SIMPLIFICATION: Assume 'node.progress' is the one we apply full boost to from pending.

        // Re-calculate original progress to correctly apply the boost
        // This is a bit of a hack due to modifying 'nodes' directly for visual effect.
        // Ideally, MoonNode would take a displayProgress prop.
        let originalProgress = node.progress || 0; // This is currently the visually reduced progress.
        // Find this node in the *original* rawNodes to get its true original progress
        const originalNode = rawNodes.find(rn => rn.id === node.id);
        if (originalNode) {
            originalProgress = originalNode.progress || 0;
        }

        const newFinalProgress = Math.min(100, originalProgress + pendingGoalUpdates[node.id].progressBoost);
        const newActions = [...(originalNode?.recentActions || []), ...pendingGoalUpdates[node.id].newActions];
        
        console.log(`[Cutscene] Applying to ${node.id}: old progress ${originalProgress}, boost ${pendingGoalUpdates[node.id].progressBoost}, new final progress ${newFinalProgress}`);
        return { ...node, progress: newFinalProgress, recentActions: newActions };
      }
      return node;
    });
    set({ pendingGoalUpdates: null, nodes: finalNodes });
    console.log("[Cutscene] Final node states after applying changes:", get().nodes);
  },
  _endCutscene: () => {
    console.log('[Cutscene] Ending cutscene.');
    // Potentially refresh nodes from original source if they were only shallow copied for cutscene
    // For now, assume `_applyPendingChanges` correctly sets the final state.
    set({
      isCutsceneActive: false,
      cutsceneStep: 'idle',
      currentAccomplishments: null,
      currentAnimatingAccomplishmentIndex: -1,
    });
    // TODO: Restore scroll
  },
  setCutsceneStep: (step) => set({ cutsceneStep: step }),
  setCurrentAnimatingAccomplishmentIndex: (index) => set({ currentAnimatingAccomplishmentIndex: index }),
  updateNodeProgress: (nodeId, newProgress) => {
    set(state => ({
      nodes: state.nodes.map(node => 
        node.id === nodeId ? { ...node, progress: Math.min(100, Math.max(0, newProgress)) } : node
      )
    }));
  },
})); 