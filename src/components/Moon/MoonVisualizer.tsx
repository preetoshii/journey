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
    title: "The Confident Leader",
    subtitle: "You couldn't name what was scary about leading before. This month, you uncovered it — taking up space — and began carving a path forward.",
    color: "#a43e63",
    positions: {
      level1: { x: -480, y: 25 },
      level2: { x: -480, y: 25 },
      level3: { x: 0, y: 0 }
    },
    progress: 50,
    goals: [
      { title: "Uncover why you hesitate to take the lead.", status: "completed", date: "04/14/25", recap: "Recap coming soon!" },
      { title: "Explore your fear of judgment.", status: "completed", date: "04/12/25", recap: "Recap coming soon!" },
      { title: "Notice when you defer decisions to avoid conflict.", status: "completed", date: "04/10/25", recap: "Recap coming soon!" },
      { title: "Roleplay leading a tough conversation.", status: "completed", date: "04/08/25", recap: "Recap coming soon!" },
      { title: "Practice giving clear direction.", status: "completed", date: "04/05/25", recap: "Recap coming soon!" },
      { title: "Share leadership vision with a mentor by Friday.", status: "active", recap: "", progressText: "You've drafted most of your vision. Just a few tweaks left before sharing it!" },
      { title: "Practice one leadership skill daily for 2 weeks.", status: "active", recap: "", progressText: "You've practiced for 5 days in a row. Keep going—consistency is key!" },
    ],
    growthNarrative: {
      'last month': "A month ago, you would operate more with fear, but now you've learned to sit with that fear and not react as strongly to it.",
      'last 6 months': "Six months ago, you were hesitant to take on leadership roles, but now you step up with more confidence and inspire others.",
      'all time': "Since you began this journey, you've transformed from someone who doubted their leadership abilities to someone who leads with authenticity and courage."
    }
  },
  {
    id: "moon2",
    role: "moon",
    title: "The Present Partner",
    subtitle: "You mentioned several moments you were distracted during family time. But this month, you carved out focused blocks, and unplugged at the park. Nice.",
    color: "#4a9063",
    positions: {
      level1: { x: 0, y: 135 },
      level2: { x: 0, y: 135 },
      level3: { x: 0, y: 0 }
    },
    progress: 75,
    goals: [
      { title: "Notice your biggest distraction triggers.", status: "completed", date: "04/16/25", recap: "Recap coming soon!" },
      { title: "Analyze your attention patterns for insights.", status: "completed", date: "04/13/25", recap: "Recap coming soon!" },
      { title: "Explore why you multitask when feeling anxious.", status: "completed", date: "04/11/25", recap: "Recap coming soon!" },
      { title: "Formulate a plan for a daily digital detox.", status: "completed", date: "04/09/25", recap: "Recap coming soon!" },
      { title: "Plan a focused work session.", status: "completed", date: "04/06/25", recap: "Recap coming soon!" },
      { title: "Limit phone checks to less than 5 per hour by week's end.", status: "active", recap: "", progressText: "Last week, you averaged 8 checks per hour. You're making progress!" },
      { title: "Spend 30 mins device-free with family daily for 2 weeks.", status: "active", recap: "", progressText: "So far, you've had 4 device-free days. Keep it up, you're building a great habit." },
    ],
    growthNarrative: {
      'last month': "A month ago, you struggled to unplug during family time, but now you've created focused blocks and enjoyed more present moments.",
      'last 6 months': "Six months ago, distractions constantly pulled you away from what mattered. Now, you've built habits to reclaim your focus.",
      'all time': "Since starting this journey, you've gone from feeling scattered to being able to intentionally direct your attention and be present."
    }
  },
  {
    id: "moon3",
    role: "moon",
    title: "The Deep Worker",
    subtitle: "Before, you often sidestepped disagreement. This month, you held your view in multiple team calls, especially in that priority tradeoff last Thursday.",
    color: "#8e4fb6",
    positions: {
      level1: { x: 480, y: 25 },
      level2: { x: 480, y: 25 },
      level3: { x: 0, y: 0 }
    },
    progress: 30,
    goals: [
      { title: "Uncover why you struggle with delegation.", status: "completed", date: "04/15/25", recap: "Recap coming soon!" },
      { title: "Notice when you avoid conflict to keep the peace.", status: "completed", date: "04/14/25", recap: "Recap coming soon!" },
      { title: "Challenge feelings of guilt when prioritizing work.", status: "completed", date: "04/12/25", recap: "Recap coming soon!" },
      { title: "Roleplay saying 'no' to new requests.", status: "completed", date: "04/10/25", recap: "Recap coming soon!" },
      { title: "Practice stating your opinion first in discussions.", status: "completed", date: "04/07/25", recap: "Recap coming soon!" },
      { title: "Block two 90-min deep work sessions this week.", status: "active", recap: "", progressText: "You've scheduled one session for Wednesday. One more to go!" },
      { title: "Review boundaries checklist daily for 20 workdays.", status: "active", recap: "", progressText: "So far, you're at 12 days. Keep it up, you're almost there." },
    ],
    growthNarrative: {
      'last month': "A month ago, you would often sidestep disagreement, but now you've started to hold your view in team calls.",
      'last 6 months': "Six months ago, you rarely voiced your stance. Now, you're more comfortable expressing your perspective, even in tough situations.",
      'all time': "Since the beginning, you've grown from avoiding conflict to standing firm in your values and boundaries."
    }
  }
];

/**
 * @component MoonVisualizer
 * @description This component acts as the central layout engine and orchestrator for the entire moon
 * visualization. Its primary responsibility is to render the collection of `MoonNode` components and
 * calculate their positions, scales, and states based on the global application mode ('overview' or 'detail')
 * and which moon is currently focused.
 *
 * It does not manage the internal state of any individual moon. Instead, it subscribes to the global
 * `useJourneyModeStore` (Zustand) to get the `mode` and `focusedMoonIndex`. Based on these values,
 * it calculates the `targetX`, `targetY`, `targetScale`, `isFocused`, and `isDot` props for each
 * `MoonNode`. This centralized approach allows for complex, choreographed animations where all moons
 * move in concert when the application state changes.
 *
 * It also handles the "click outside" interaction to deselect a focused moon and return to the
 * overview, providing an intuitive navigation path for the user.
 */
export const MoonVisualizer = () => {
  const currentLevel = 'level1'; // Kept for base positions, but zoom is removed
  const [hoveredMoonId, setHoveredMoonId] = React.useState<string | null>(null);
  const mode = useJourneyModeStore((s) => s.mode);
  const focusedMoonIndex = useJourneyModeStore((s) => s.focusedMoonIndex); // 0: none, 1-3: specific moon
  const setMode = useJourneyModeStore((s) => s.setMode);
  const setFocusedMoonIndex = useJourneyModeStore((s) => s.setFocusedMoonIndex);
  const setIsMoonHovered = useJourneyModeStore((s) => s.setIsMoonHovered);
  const storeNodes = useJourneyModeStore((s) => s.nodes); // Add this line to get nodes from store

  /**
   * Detail View Layout Configuration
   * --------------------------------
   * This block of constants defines the precise layout for the moons when the application is in 'detail' mode.
   * Instead of being spread out as they are in the overview, the moons arrange themselves into a specific,
   * static configuration:
   *
   * - `detailMoonX`/`detailMoonY`: Defines the target coordinates for the single `isFocused` moon, moving it
   *   to the left side of the screen to make room for the detail cards on the right.
   * - `dotMoonX`: Defines the X coordinate where the non-focused moons will stack vertically as small 'dots'.
   * - `dotSpacing`: Controls the vertical distance between these dots.
   * - `dotSlotYPositions`: This array is calculated based on the number of moons and the spacing, providing a
   *   pre-computed list of Y-coordinates for each dot's "slot". This ensures they are always perfectly centered
   *   and evenly spaced, regardless of the number of moons.
   */
  const detailMoonX = -360; // X position for the focused moon (balanced spacing)
  const dotMoonX = -800;    // X position for the dot moons
  const detailMoonY = 0;    // Centered Y for focused moon
  const dotSpacing = 40;    // Vertical spacing between dots
  const placeholderDotSize = 22; // Approx. 440 * 0.05 scale

  const moonNodesOnly = storeNodes.filter(node => node.role === 'moon'); // Use storeNodes instead of nodes
  const numberOfMoons = moonNodesOnly.length;

  // Calculate Y positions for each of the 3 dot slots
  const dotSlotYPositions = Array.from({ length: numberOfMoons }, (_, i) => {
    return detailMoonY + (i - (numberOfMoons - 1) / 2) * dotSpacing;
  });
  // For 3 moons, this results in: [-dotSpacing, 0, dotSpacing] relative to detailMoonY

  /**
   * Click-Away Deselection Logic
   * ----------------------------
   * This `div` acts as a capture area for mouse events to implement a "click outside to deselect" feature.
   * When in 'detail' mode, if a user clicks on the background area of the visualizer (i.e., not on an
   * interactive `MoonNode` element), it transitions the application state back to 'overview'.
   *
   * It works by recording the mouse down position and comparing it to the mouse up position to prevent
   * firing on drags. It then checks if the click target was part of a `[data-moon-node]`. If not,
   * and if a moon is currently focused, it calls `setMode('overview')` and `setFocusedMoonIndex(0)`
   * from the global store, triggering the animated transition back to the main overview layout.
   */
  return (
    <div 
      style={{ 
        position: 'sticky',
        top: 0,
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        pointerEvents: 'none',
        zIndex: 10,
        mixBlendMode: 'screen',
        gridRow: '1 / 2',
        gridColumn: '1 / 2',
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
        {storeNodes.map((node, arrayIndex) => { // Renamed idx to arrayIndex for clarity
          /**
           * Per-Node Layout Calculation
           * ---------------------------
           * This is the core logic of the MoonVisualizer, executed for every node on every render. It determines
           * the precise layout properties (`targetX`, `targetY`, `targetScale`, etc.) for each `MoonNode`
           * based on the current global application state (`mode` and `focusedMoonIndex`).
           *
           * The logic follows a clear path:
           * 1. Sun Handling: If the node is the 'sun', it's given a fixed position and is never interactive.
           * 2. Overview Mode: If the mode is 'overview', all moon nodes are given their default positions and
           *    a scale of 1. `isFocused` and `isDot` are both false.
           * 3. Detail Mode: If the mode is 'detail', it checks if the current node's index matches the
           *    `focusedMoonIndex` from the store.
           *    - If it's the focused moon, it's assigned the `detailMoonX`/`Y` coordinates and a larger
           *      `targetScale`. `isFocused` is set to true.
           *    - If it's NOT the focused moon, it's designated as a 'dot'. It's sent to the `dotMoonX`
           *      coordinate and its specific vertical slot (`dotSlotYPositions`). Its scale is shrunk
           *      dramatically, and `isDot` is set to true.
           *
           * These calculated props are then passed down to the `MoonNode`, which handles the actual animation
           * to these target values.
           */
          let targetX = node.positions[currentLevel].x;
          let targetY = node.positions[currentLevel].y;
          let targetScale = 1;
          let isFocused = false;
          let isDot = false;

          // In overview mode, all moons use their default L1 positions.
          if (mode === 'overview' || focusedMoonIndex === 0) {
            targetX = node.positions[currentLevel].x;
            targetY = node.positions[currentLevel].y;
            targetScale = 1;
            isFocused = false;
            isDot = false;
          } else {
            // In detail mode, we arrange the moons into a focused layout.
            // focusedMoonStoreIndex is 0-based for array comparison.
            const focusedMoonStoreIndex = focusedMoonIndex - 1; 

            if (arrayIndex === focusedMoonStoreIndex) {
              // This moon is the currently focused one.
              targetX = detailMoonX;
              targetY = detailMoonY;
              targetScale = 1.5; // Adjusted scale for focused moon
              isFocused = true;
              isDot = false;
            } else {
              // This moon becomes a "dot" on the side.
              targetX = dotMoonX;
              targetY = dotSlotYPositions[arrayIndex]; // Use the moon's own slot index
              targetScale = 0.05;
              isFocused = false;
              isDot = true;
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
              onMouseEnter={() => {
                if (node.role === 'moon') {
                  setHoveredMoonId(node.id);
                  setIsMoonHovered(true);
                }
              }}
              onMouseLeave={() => {
                if (node.role === 'moon') {
                  setHoveredMoonId(null);
                  setIsMoonHovered(false);
                }
              }}
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
            Array.from({ length: numberOfMoons }).map((_, i) => {
              if (i === focusedMoonIndex - 1) {
                // White dot for the current (empty) slot
                return (
                  <motion.div
                    key={`placeholder-dot-active-${i}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: dotMoonX,
                      y: dotSlotYPositions[i],
                    }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.5 }}
                    style={{
                      position: "absolute",
                      width: placeholderDotSize,
                      height: placeholderDotSize,
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      pointerEvents: 'none',
                    }}
                  />
                );
              } else {
                // Dark gray dot for the other moons
                return (
                  <motion.div
                    key={`placeholder-dot-inactive-${i}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: dotMoonX,
                      y: dotSlotYPositions[i],
                    }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.5 }}
                    style={{
                      position: "absolute",
                      width: placeholderDotSize,
                      height: placeholderDotSize,
                      borderRadius: "50%",
                      backgroundColor: "rgba(80, 80, 80, 0.9)",
                      pointerEvents: 'none',
                    }}
                  />
                );
              }
            })
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 