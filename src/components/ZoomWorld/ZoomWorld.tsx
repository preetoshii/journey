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
    title: "The Sun",
    subtitle: "Center of our universe",
    color: "#FFD700",
    positions: {
      level1: { x: 0, y: 0 },
      level2: { x: 0, y: 0 },
      level3: { x: 0, y: 0 }
    }
  },
  {
    id: "moon1",
    role: "moon",
    title: "Moon One",
    subtitle: "First moon",
    color: "#4A90E2",
    positions: {
      level1: { x: -300, y: 0 },
      level2: { x: -400, y: -200 },
      level3: { x: 0, y: 0 }
    }
  },
  {
    id: "moon2",
    role: "moon",
    title: "Moon Two",
    subtitle: "Second moon",
    color: "#50E3C2",
    positions: {
      level1: { x: 0, y: 300 },
      level2: { x: 0, y: 400 },
      level3: { x: 0, y: 0 }
    }
  },
  {
    id: "moon3",
    role: "moon",
    title: "Moon Three",
    subtitle: "Third moon",
    color: "#F5A623",
    positions: {
      level1: { x: 300, y: 0 },
      level2: { x: 400, y: -200 },
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
      position: "relative" // Position context for children
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