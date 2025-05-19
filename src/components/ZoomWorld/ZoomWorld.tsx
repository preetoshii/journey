/*
  ZoomWorld.tsx
  -------------------
  This is the main component for the zoomable, pannable world interface. It renders the sun and moons, manages zoom levels, and wires up all panning and snapping logic via the usePanning hook.

  HOW TO USE:
  - This component is the root of the zoomable world UI. It renders the nodes and zoom controls.
  - All panning, snapping, and animation logic is handled by the usePanning hook.
  - To change panning/snapping behavior, edit usePanning.ts.

  WHAT IT HANDLES:
  - Renders all nodes (sun and moons) at their correct positions
  - Handles zoom level state and passes it to usePanning
  - Wires up drag and trackpad panning via usePanning
  - Renders zoom controls
*/

import { motion } from 'framer-motion';
import { useZoomStore } from './useZoomStore';
import { SunMoonNode } from './SunMoonNode';
import { ZoomControls } from './ZoomControls';
import type { ZoomNode } from '../../types';
import { usePanning } from './usePanning';

// --- Sample data for nodes (sun and moons) ---
// In a real app, this would come from props or an API
const nodes: ZoomNode[] = [
  {
    id: "sun",
    role: "sun",
    title: "Become the steady, luminous presence, grounded in truth, and fully here.",
    subtitle: "",
    color: "#FFD700",
    positions: {
      level1: { x: 0, y: -100 },
      level2: { x: 0, y: 0 },
      level3: { x: 0, y: 0 }
    }
  },
  {
    id: "moon1",
    role: "moon",
    title: "Embody inspiring leadership",
    subtitle: "You couldn't name what was scary about leading before. This month, you uncovered it — taking up space — and began carving a path forward.",
    color: "#874b80",
    positions: {
      level1: { x: -520, y: -100 },
      level2: { x: -460, y: -250 },
      level3: { x: 0, y: 0 }
    }
  },
  {
    id: "moon2",
    role: "moon",
    title: "Break free from distraction",
    subtitle: "You mentioned several moments you were distracted during family time. But this month, you carved out focused blocks, and unplugged at the park. Nice.",
    color: "#5a8271",
    positions: {
      level1: { x: 0, y: 350 },
      level2: { x: 0, y: 500 },
      level3: { x: 0, y: 0 }
    }
  },
  {
    id: "moon3",
    role: "moon",
    title: "Stand firm in my stance",
    subtitle: "Before, you often sidestepped disagreement. This month, you held your view in multiple team calls, especially in that priority tradeoff last Thursday.",
    color: "#a05674",
    positions: {
      level1: { x: 520, y: -100 },
      level2: { x: 460, y: -250 },
      level3: { x: 0, y: 0 }
    }
  }
];

/**
 * ZoomWorld
 * Main component for the zoomable world UI.
 * Handles rendering, zoom state, and panning/snapping via usePanning.
 */
export const ZoomWorld = () => {
  // --- Get current zoom level from store ---
  const { currentLevel } = useZoomStore();
  // --- Get panning/snapping logic from custom hook ---
  const { x, y, controls, handleDragEnd, handleWheel } = usePanning({ nodes, currentLevel });

  return (
    <div style={{ 
      width: "100vw", // Full viewport width
      height: "100vh", // Full viewport height
      overflow: "hidden", // Hide overflow for panning
      position: "relative", // Position context for children
      background: "black" // Set background to black
    }}>
      {/* Main panning container. Handles drag and trackpad panning. */}
      <motion.div
        drag={currentLevel !== "level1"} // Enable drag except at level1
        dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }} // Large drag bounds
        animate={controls} // Imperative animation controls (for snapping)
        onDragEnd={handleDragEnd} // Unified drag end handler
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          x, // Framer Motion x motion value
          y  // Framer Motion y motion value
        }}
        onWheel={handleWheel} // Unified trackpad handler
      >
        {/* Render all nodes (sun and moons) */}
        {nodes.map((node) => (
          <SunMoonNode key={node.id} node={node} />
        ))}
      </motion.div>
      {/* Render zoom controls */}
      <ZoomControls />
    </div>
  );
}; 