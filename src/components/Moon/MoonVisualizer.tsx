/*
  MoonVisualizer.tsx
  -------------------
  This is the main component for the moon visualization interface. It renders the sun and moons, and manages their layout and appearance based on the current mode (overview/detail) and the focused moon.

  HOW TO USE:
  - This component is the root of the moon visualization UI.
  - All layout and animation logic for the moons is handled here.

  WHAT IT HANDLES:
  - Renders all nodes (sun and moons) at their correct positions
  - Manages layout based on `mode` and `focusedMoonIndex` from the store.
  - Handles transitions between focused states.
  - Renders placeholder dots for focused moon slots in detail view.
*/

import { motion, AnimatePresence } from 'framer-motion';
import { MoonNode } from './MoonNode';
import React from 'react'; // Removed useEffect as it's not used directly here anymore
import { useJourneyModeStore } from '../../store/useJourneyModeStore';
import type { ZoomNode } from '../../types';

// --- Sample data for nodes (sun and moons) ---
// In a real app, this would come from props or an API
export const nodes: ZoomNode[] = [
  {
    id: "moon1",
    role: "moon",
    title: "Embody inspiring leadership",
    subtitle: "You couldn't name what was scary about leading before. This month, you uncovered it — taking up space — and began carving a path forward.",
    color: "#a43e63",
    positions: {
      level1: { x: -480, y: 25 },
      level2: { x: -480, y: 25 },
      level3: { x: 0, y: 0 }
    },
    progress: 50,
    recentActions: [
      // Discovery
      "You uncovered why you hesitate to take the lead in group settings.",
      "You realized your fear of being judged holds you back from speaking up.",
      "You noticed you defer decisions to avoid conflict.",
      // Practice
      "You roleplayed leading a tough conversation with your coach.",
      "You practiced giving clear direction in a mock scenario.",
      "You wrote down your leadership values and shared them with a peer.",
      // Action
      "You volunteered to present at the all-hands.",
    ]
  },
  {
    id: "moon2",
    role: "moon",
    title: "Break free from distraction",
    subtitle: "You mentioned several moments you were distracted during family time. But this month, you carved out focused blocks, and unplugged at the park. Nice.",
    color: "#4a9063",
    positions: {
      level1: { x: 0, y: 135 },
      level2: { x: 0, y: 135 },
      level3: { x: 0, y: 0 }
    },
    progress: 75,
    recentActions: [
      // Discovery
      "You noticed your biggest distraction trigger is checking your phone after meetings.",
      "You tracked your attention and found afternoons are your least focused.",
      "You realized you multitask most when feeling anxious.",
      // Practice
      "You practiced a 10-minute daily digital detox.",
      "You set a timer for focused work and reflected on the results.",
      "You tried mindful breathing when you felt the urge to check your phone.",
      // Action
      "You put your phone away during dinner.",
    ]
  },
  {
    id: "moon3",
    role: "moon",
    title: "Stand firm in my stance",
    subtitle: "Before, you often sidestepped disagreement. This month, you held your view in multiple team calls, especially in that priority tradeoff last Thursday.",
    color: "#8e4fb6",
    positions: {
      level1: { x: 480, y: 25 },
      level2: { x: 480, y: 25 },
      level3: { x: 0, y: 0 }
    },
    progress: 30,
    recentActions: [
      // Discovery
      "You uncovered why you struggle with delegation and saying no.",
      "You noticed you avoid conflict to keep the peace, even when it costs you.",
      "You realized you feel guilty when prioritizing your own work.",
      // Practice
      "You roleplayed saying no to further requests.",
      "You practiced stating your opinion first in a group discussion.",
      "You wrote out your boundaries and rehearsed them aloud.",
      // Action
      "You held your view in a tough meeting.",
    ]
  }
];

/**
 * MoonVisualizer
 * Main component for the moon visualization UI.
 * Handles rendering and layout of moons based on global state.
 */
export const MoonVisualizer = () => {
  const currentLevel = 'level1'; // Kept for base positions, but zoom is removed
  const [hoveredMoonId, setHoveredMoonId] = React.useState<string | null>(null);
  const mode = useJourneyModeStore((s) => s.mode);
  const focusedMoonIndex = useJourneyModeStore((s) => s.focusedMoonIndex); // 0: none, 1-3: specific moon
  const setMode = useJourneyModeStore((s) => s.setMode);
  const setFocusedMoonIndex = useJourneyModeStore((s) => s.setFocusedMoonIndex);

  // Layout logic for detail mode when a moon is focused
  const detailMoonX = -420; // X position for the focused moon
  const dotMoonX = -800;    // X position for the dot moons
  const detailMoonY = 0;    // Centered Y for focused moon
  const dotSpacing = 40;    // Vertical spacing between dots
  const placeholderDotSize = 22; // Approx. 440 * 0.05 scale

  const moonNodesOnly = nodes.filter(node => node.role === 'moon');
  const numberOfMoons = moonNodesOnly.length;

  // Calculate Y positions for each of the 3 dot slots
  const dotSlotYPositions = Array.from({ length: numberOfMoons }, (_, i) => {
    return detailMoonY + (i - (numberOfMoons - 1) / 2) * dotSpacing;
  });
  // For 3 moons, this results in: [-dotSpacing, 0, dotSpacing] relative to detailMoonY

  return (
    <div 
      style={{ 
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        pointerEvents: 'none', // Main container doesn't need pointer events
      }}
      onMouseDown={(e) => {
        (window as any)._moonVisualizerMouseDown = { x: e.clientX, y: e.clientY };
      }}
      onMouseUp={(e) => {
        if (mode !== 'detail') return;
        // Only act if a moon is currently focused
        if (focusedMoonIndex === 0) return; 

        const down = (window as any)._moonVisualizerMouseDown;
        // Check for drag vs. click
        if (down && (Math.abs(e.clientX - down.x) > 5 || Math.abs(e.clientY - down.y) > 5)) return;
        // Check if click was on a moon node itself
        if ((e.target as HTMLElement).closest('[data-moon-node]')) return;
        
        // Click was outside a moon in detail mode while a moon was focused
        // Transition back to overview mode and unfocus moon
        setMode('overview');
        setFocusedMoonIndex(0);
      }}
    >
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}
      >
        {nodes.map((node, arrayIndex) => { // Renamed idx to arrayIndex for clarity
          let targetX = node.positions[currentLevel].x;
          let targetY = node.positions[currentLevel].y;
          let targetScale = 1;
          let isFocused = false;
          let isDot = false;

          // Sun node handling (always uses its L1 position, never focused/dot)
          if (node.role === 'sun') {
            targetX = node.positions.level1.x;
            targetY = node.positions.level1.y;
            targetScale = 1; 
            isFocused = false;
            isDot = false;
          } else if (node.role === 'moon') {
            // Moon specific logic
            if (mode === 'overview' || focusedMoonIndex === 0) {
              // Standard overview layout for all moons
              targetX = node.positions[currentLevel].x;
              targetY = node.positions[currentLevel].y;
              targetScale = 1;
              isFocused = false;
              isDot = false;
            } else {
              // Detail mode with a focused moon (focusedMoonIndex is 1, 2, or 3)
              // focusedMoonStoreIndex is 0-based for array comparison
              const focusedMoonStoreIndex = focusedMoonIndex - 1; 

              if (arrayIndex === focusedMoonStoreIndex) {
                // This moon is the currently focused one
                targetX = detailMoonX;
                targetY = detailMoonY;
                targetScale = 1.5; // Adjusted scale for focused moon
                isFocused = true;
                isDot = false;
              } else {
                // This moon is a dot, send it to its designated slot Y position
                targetX = dotMoonX;
                targetY = dotSlotYPositions[arrayIndex]; // Use the moon's own slot index
                targetScale = 0.05;
                isFocused = false;
                isDot = true;
              }
            }
          }

          return (
            <MoonNode
              key={node.id}
              node={node}
              // Pass the moon's 1-based index for click handling if needed, or its actual array index
              // For now, MoonNode can use its own node.id or we can pass its actual 0-based index.
              // The focusedMoonIndex in store is 1-based for user-facing logic (1,2,3).
              moonOrderIndex={arrayIndex + 1} // Passing 1-based index for consistency if needed by MoonNode
              staggerOffset={arrayIndex * 0.15} // Reduced stagger for quicker feel
              hoveredMoonId={hoveredMoonId}
              onMouseEnter={() => node.role === 'moon' && setHoveredMoonId(node.id)}
              onMouseLeave={() => node.role === 'moon' && setHoveredMoonId(null)}
              mode={mode} // Pass current mode
              isFocused={isFocused}
              isDot={isDot}
              targetX={targetX}
              targetY={targetY}
              targetScale={targetScale}
            />
          );
        })}

        {/* Placeholder for the focused moon's slot */}
        <AnimatePresence>
          {mode === 'detail' && focusedMoonIndex > 0 && (
            <motion.div
              key={`placeholder-dot-${focusedMoonIndex - 1}`} // Key by the slot index (0-based)
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: 1, 
                x: dotMoonX,
                y: dotSlotYPositions[focusedMoonIndex - 1], // Position in the focused moon's actual slot
              }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.5 }}
              style={{
                position: "absolute",
                width: placeholderDotSize,
                height: placeholderDotSize,
                borderRadius: "50%",
                backgroundColor: "rgba(80, 80, 80, 0.9)", // Dark grey placeholder
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 