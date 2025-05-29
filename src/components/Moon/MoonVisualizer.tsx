/*
  MoonVisualizer.tsx
  -------------------
  This is the main component for the moon visualization interface. It renders the sun and moons, and manages their layout and appearance based on the current mode (overview/detail).

  HOW TO USE:
  - This component is the root of the moon visualization UI.
  - All layout and animation logic for the moons is handled here.

  WHAT IT HANDLES:
  - Renders all nodes (sun and moons) at their correct positions
  - Manages layout for overview and detail modes
  - Handles transitions between modes
*/

import { motion } from 'framer-motion';
import { MoonNode } from './MoonNode';
import React, { useEffect } from 'react';
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
 * Handles rendering and layout of moons.
 */
export const MoonVisualizer = () => {
  const currentLevel = 'level1'; // Kept for positions, but zoom is removed
  const [hoveredMoonId, setHoveredMoonId] = React.useState<string | null>(null);
  const mode = useJourneyModeStore((s) => s.mode);

  // Layout logic for detail mode
  const detailMoonX = -420; // X position for the focused moon
  const dotMoonX = -800; // X position for the dot moons
  const detailMoonY = 0; // Centered Y for focused moon
  const dotSpacing = 40; // Vertical spacing between dots
  
  // Determine focused moon index (e.g., first moon in detail mode)
  // This could be made dynamic based on scroll or click in the future
  const focusedIdx = mode === 'detail' ? 0 : null;

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
        // Flag for drag vs. click detection (if needed for future interactions)
        (window as any)._moonVisualizerMouseDown = { x: e.clientX, y: e.clientY };
      }}
      onMouseUp={(e) => {
        // Handle click outside moons in detail mode (e.g., to return to overview)
        if (mode !== 'detail') return;
        const down = (window as any)._moonVisualizerMouseDown;
        if (down && (Math.abs(e.clientX - down.x) > 5 || Math.abs(e.clientY - down.y) > 5)) return; // Drag
        if ((e.target as HTMLElement).closest('[data-moon-node]')) return; // Clicked on a moon
        
        // TODO: Implement logic to switch back to overview mode if desired
        // useJourneyModeStore.getState().setMode('overview');
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
        {nodes.map((node, idx) => {
          let targetX = node.positions[currentLevel].x;
          let targetY = node.positions[currentLevel].y;
          let targetScale = 1;
          let isFocused = false;
          let isDot = false;

          if (mode === 'detail') {
            if (focusedIdx !== null && idx === focusedIdx) {
              // Focused moon: large, left column
              targetX = detailMoonX;
              targetY = detailMoonY;
              targetScale = 1.18;
              isFocused = true;
            } else {
              // Dot moons: small, stacked vertically
              const dotIdx = focusedIdx !== null && idx < focusedIdx ? idx : idx - 1;
              targetX = dotMoonX;
              targetY = detailMoonY + (dotIdx - (nodes.filter(n => n.role === 'moon').length -1) / 2) * dotSpacing;
              targetScale = 0.05;
              isDot = true;
            }
          }
          
          // Ensure SunNode (if any) is not treated as a dot or focusable moon
          if (node.role === 'sun') {
            isFocused = false;
            isDot = false;
            // Use its L1 position directly, or adjust if needed for overview
            targetX = node.positions.level1.x;
            targetY = node.positions.level1.y;
            targetScale = 1; 
          }

          return (
            <MoonNode
              key={node.id}
              node={node}
              staggerOffset={idx * 3} // Stagger animation for visual appeal
              hoveredMoonId={hoveredMoonId}
              onMouseEnter={() => node.role === 'moon' && setHoveredMoonId(node.id)}
              onMouseLeave={() => node.role === 'moon' && setHoveredMoonId(null)}
              data-moon-node='true' // Simplified, as it's always a moon
              mode={mode}
              isFocused={isFocused}
              isDot={isDot}
              targetX={targetX}
              targetY={targetY}
              targetScale={targetScale}
            />
          );
        })}
      </motion.div>
    </div>
  );
}; 