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

import { motion, AnimatePresence } from 'framer-motion';
import type { ZoomNode } from '../../types';
import { useZoomStore } from './useZoomStore';
import { MoonAnimatedBackground } from './MoonAnimatedBackground';
import React from 'react';
import { playRandomPentatonicNote } from './soundUtils';
import { ArcProgressBar } from './ArcProgressBar';

// Props for the SunMoonNode component
interface SunMoonNodeProps {
  node: ZoomNode; // The node to render (sun or moon)
  onDebugChange?: (isDebug: boolean) => void; // Callback for debug state changes
}

// Shared constants
const CIRCLE_LARGE_SIZE = 750;
const SUN_LARGE_SIZE = 400;
const CIRCLE_SMALL_SIZE = 60;
const BORDER_WIDTH = 1.5;

/**
 * SunMoonNode
 * Renders a single node (sun or moon) with animation and click logic.
 */
export const SunMoonNode = ({ node, onDebugChange }: SunMoonNodeProps) => {
  // --- Get relevant state and actions from the store ---
  const { currentLevel, zoomIn, setPanTarget, focusedMoonId } = useZoomStore();
  // --- Destructure node properties ---
  const { positions, role, title, subtitle, color } = node;

  // --- Derived state ---
  const isMoon = role === "moon";
  const currentPosition = positions[currentLevel];
  const isFocused = node.id === focusedMoonId;
  const [tapAnim, setTapAnim] = React.useState(false);
  const [bgActive, setBgActive] = React.useState(false);
  const [wasInLevel1, setWasInLevel1] = React.useState(false);
  const [arcActive, setArcActive] = React.useState(false);
  const [isDebug, setIsDebug] = React.useState(false);
  
  // Track if we were in level 1
  React.useEffect(() => {
    if (currentLevel === "level1") {
      setWasInLevel1(true);
    } else if (currentLevel === "level2") {
      setWasInLevel1(false);
    }
  }, [currentLevel]);

  // Effect to handle focus changes
  React.useEffect(() => {
    if (isFocused && currentLevel === "level2") {
      setTapAnim(true);
      playRandomPentatonicNote();
    }
  }, [isFocused, currentLevel]);

  // Delay activation of animated background after focusing in L2
  React.useEffect(() => {
    if (currentLevel === "level2" && isMoon && isFocused) {
      if (wasInLevel1) {
        // If coming from level 1, delay the background
        const timeout = setTimeout(() => setBgActive(true), 800);
        return () => clearTimeout(timeout);
      } else {
        // If already in level 2, activate immediately
        setBgActive(true);
      }
    } else {
      setBgActive(false);
    }
  }, [currentLevel, isMoon, isFocused, wasInLevel1]);

  // Show arc with 0.6s delay on focus in L2
  React.useEffect(() => {
    if (isMoon && currentLevel === "level2" && isFocused) {
      const timeout = setTimeout(() => setArcActive(true), 600);
      return () => clearTimeout(timeout);
    } else {
      setArcActive(false);
    }
  }, [isMoon, currentLevel, isFocused]);

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

  // --- Decoupled animation values for moons ---
  // Circle size
  const moonCircleSize = isMoon
    ? (currentLevel === "level1" ? CIRCLE_SMALL_SIZE : CIRCLE_LARGE_SIZE)
    : (currentLevel === "level1" ? SUN_LARGE_SIZE : CIRCLE_LARGE_SIZE);
  // Border width (shared)
  const circleBorderWidth = BORDER_WIDTH;
  // Text size (constant for moons)
  const moonTitleFontSize = "2rem";
  const moonSubtitleFontSize = "1.05rem";

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
        x: currentPosition.x,
        y: currentPosition.y,
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
      {/* Circle */}
      {isMoon && currentLevel === "level2" && (
        <>
          <MoonAnimatedBackground
            color={color}
            active={bgActive}
            gridImageUrl="/src/assets/grid.png"
            rotatingImageUrl="/src/assets/rotatingimage.png"
            size={CIRCLE_LARGE_SIZE}
          />
          {isFocused && arcActive && (
            <ArcProgressBar
              progress={typeof node.progress === 'number' ? node.progress : 0}
              radius={CIRCLE_LARGE_SIZE / 2}
              thickness={10}
              color="white"
              glowColor="rgba(255,255,255,0.18)"
              active={true}
              animationDuration={1.3}
              containerSize={CIRCLE_LARGE_SIZE + 20}
              onDebugChange={onDebugChange}
            />
          )}
        </>
      )}
      <motion.div
        key={isMoon ? `moon-circle-${currentLevel}` : `sun-circle`}
        style={{
          borderRadius: "50%",
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          borderStyle: "solid",
          borderColor: "white",
          boxShadow: `0 0 32px 4px rgba(255, 255, 255, 0.18)`
        }}
        initial={{
          width: isMoon ? (currentLevel === "level1" ? CIRCLE_LARGE_SIZE : CIRCLE_SMALL_SIZE) : (currentLevel === "level1" ? SUN_LARGE_SIZE : CIRCLE_LARGE_SIZE),
          height: isMoon ? (currentLevel === "level1" ? CIRCLE_LARGE_SIZE : CIRCLE_SMALL_SIZE) : (currentLevel === "level1" ? SUN_LARGE_SIZE : CIRCLE_LARGE_SIZE),
          borderWidth: circleBorderWidth
        }}
        animate={{
          width: isMoon ? moonCircleSize : CIRCLE_LARGE_SIZE,
          height: isMoon ? moonCircleSize : CIRCLE_LARGE_SIZE,
          borderWidth: circleBorderWidth,
          scale: tapAnim ? 1.15 : 1
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          mass: 1,
          bounce: 0.2,
          scale: { duration: 0.3, ease: "easeInOut" }
        }}
        onAnimationComplete={() => {
          if (tapAnim) setTapAnim(false);
        }}
      >
        {/* For sun, text is always inside */}
        {role === "sun" && (
          <div style={{ textAlign: "center", padding: "0 160px" }}>
            <h3 className="sunmoon-title" style={{ margin: 0, fontSize: "2.1rem", lineHeight: 1.5, padding: "0 0.1em" }}>{title}</h3>
          </div>
        )}
      </motion.div>
      {/* For moons, text is outside in L1, inside in L2 */}
      {isMoon && (
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            width: 'max-content',
            textAlign: "center",
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: currentLevel === "level1" ? "flex-start" : "center",
            minWidth: '120px',
          }}
          animate={{
            top: currentLevel === "level1"
              ? moonCircleSize + 55
              : CIRCLE_LARGE_SIZE / 2,
            transform: 'translate(-50%, -50%)',
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            mass: 1,
            bounce: 0.2
          }}
        >
          <motion.h3
            className="sunmoon-title"
            style={{
              margin: 0,
              fontSize: moonTitleFontSize,
              fontFamily: "'Ivar Headline', serif"
            }}
            animate={{
              scale: currentLevel === "level1" ? 0.5 : 1
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              mass: 1,
              bounce: 0.2
            }}
          >
            {title}
          </motion.h3>
          <motion.p
            className="sunmoon-subtitle"
            style={{
              margin: "1rem 0 0",
              fontSize: moonSubtitleFontSize,
              height: "1.5rem", // Reserve space for the subtitle
              maxWidth: currentLevel === "level2" ? `${CIRCLE_LARGE_SIZE - 40}px` : undefined,
              padding: currentLevel === "level2" ? "0 120px" : undefined,
              boxSizing: "border-box",
              textAlign: "center",
              lineHeight: 2
            }}
            animate={{
              opacity: currentLevel === "level2" && isFocused ? 1 : 0,
              scale: currentLevel === "level2" && isFocused ? 1 : 0.8
            }}
            transition={{
              opacity: currentLevel === "level2" && isFocused
                ? { duration: 1.2, delay: 0.25 }
                : { duration: 0, delay: 0 },
              scale: { duration: 0.2 }
            }}
          >
            {subtitle}
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}; 