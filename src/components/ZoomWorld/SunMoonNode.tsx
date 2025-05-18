/*
  SunMoonNode.tsx
  -------------------
  This component renders a single node (either the Sun or a Moon) in the zoomable world.
  It handles its own animation, scaling, opacity, and click behavior based on the current zoom level and focus state.

  HOW TO USE:
  - Used by ZoomWorld to render each node (sun or moon).
  - Handles its own animation and click logic for zooming and focusing.
  - All node appearance and interaction logic is contained here.

  WHAT IT HANDLES:
  - Animated position, scale, and opacity for each node
  - Handles click to zoom/focus on moons
  - Visual distinction between focused and unfocused moons
  - Uses Framer Motion for smooth transitions
*/

import { motion } from 'framer-motion';
import type { ZoomNode } from '../../types';
import { useZoomStore } from './useZoomStore';

// Props for the SunMoonNode component
interface SunMoonNodeProps {
  node: ZoomNode; // The node to render (sun or moon)
}

/**
 * SunMoonNode
 * Renders a single node (sun or moon) with animation and click logic.
 */
export const SunMoonNode = ({ node }: SunMoonNodeProps) => {
  // --- Get relevant state and actions from the store ---
  const { currentLevel, zoomIn, setPanTarget, focusedMoonId } = useZoomStore();
  // --- Destructure node properties ---
  const { positions, role, title, subtitle, color } = node;

  // --- Derived state ---
  const isMoon = role === "moon";
  const currentPosition = positions[currentLevel];
  const isFocused = node.id === focusedMoonId;
  
  /**
   * getScale
   * Returns the scale for the node based on its role and the current zoom level.
   * Sun is always full size; moons are smaller at level1.
   */
  const getScale = () => {
    if (currentLevel === "level1") {
      return role === "sun" ? 1 : 0.3;
    }
    return 1;
  };

  /**
   * handleClick
   * Handles click events for zooming/focusing on moons.
   * - At level1: zooms in and focuses the clicked moon
   * - At level2: focuses and pans to the clicked moon
   */
  const handleClick = () => {
    if (currentLevel === "level1" && isMoon) {
      zoomIn(node.id);
    } else if (currentLevel === "level2" && isMoon) {
      // Set this moon as the focused moon and trigger panning
      useZoomStore.setState({ focusedMoonId: node.id });
      setPanTarget({ x: 0, y: 0 });
    }
  };

  return (
    <motion.div
      layoutId={node.id}
      initial={false}
      animate={{
        // Animate to the node's current position for the current zoom level
        x: currentPosition.x,
        y: currentPosition.y,
        scale: getScale(),
        // Opacity logic:
        // - All nodes visible at level1
        // - At level2, only moons are visible; focused moon is fully opaque, others are faded
        opacity: currentLevel === "level1" || role === "moon"
          ? (currentLevel === "level2" && isMoon ? (isFocused ? 1 : 0.5) : 1)
          : 0
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 1,
        bounce: 0.2
      }}
      onClick={handleClick}
      style={{
        position: "absolute",
        cursor: isMoon ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem"
      }}
    >
      {/* Render the node's circle (sun or moon) */}
      <motion.div
        style={{
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          border: `2px solid ${color}`,
          backgroundColor: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}
      >
        {/* Text container that will animate between inside/outside */}
        <motion.div
          layout
          style={{
            position: role === "moon" && currentLevel === "level1" ? "absolute" : "relative",
            top: role === "moon" && currentLevel === "level1" ? "620px" : "0",
            textAlign: "center",
            width: "100%"
          }}
        >
          <motion.h3 layout style={{ margin: 0, fontSize: "2rem" }}>{title}</motion.h3>
          <motion.p layout style={{ margin: "1rem 0 0", fontSize: "1.5rem" }}>{subtitle}</motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}; 