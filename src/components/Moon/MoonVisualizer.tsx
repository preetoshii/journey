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
              isFocused={isFocused}
              isDot={isDot}
              targetX={targetX}
              targetY={targetY}
              targetScale={targetScale}
            />
          );
        })}

        {/* Placeholder Dots for Detail Mode */}
        {/**
         * This section renders a set of placeholder "dots" that are only visible in 'detail' mode.
         * They serve two main purposes:
         * 1. Visual Stability: They create a stable visual anchor for the non-focused moons, showing
         *    all possible "slots" in the list.
         * 2. Enhanced Animation: When a moon is clicked and becomes a dot, its corresponding placeholder
         *    fades out, creating a smooth visual transition. The white dot indicates the "empty" slot
         *    of the currently focused moon.
         */}
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