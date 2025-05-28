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
import { SegmentedArcProgressBar } from './SegmentedArcProgressBar';
import { RotatingSubtitle } from './RotatingSubtitle';

// Props for the SunMoonNode component
interface SunMoonNodeProps {
  node: ZoomNode; // The node to render (sun or moon)
  onDebugChange?: (isDebug: boolean) => void; // Callback for debug state changes
  staggerOffset?: number; // Optional: stagger animation offset in seconds
  hoveredMoonId?: string | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// Shared constants
const CIRCLE_L1_SIZE = 440;
const SUN_LARGE_SIZE = 400;
const CIRCLE_SMALL_SIZE = 60;
const BORDER_WIDTH = 3;

// Helper to lighten a hex color
function lightenColor(hex: string, amount: number) {
  let col = hex.replace('#', '');
  if (col.length === 3) col = col.split('').map(x => x + x).join('');
  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

// Helper to convert hex color to rgba with alpha
function hexToRgba(hex: string, alpha: number) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * SunMoonNode
 * Renders a single node (sun or moon) with animation and click logic.
 */
export const SunMoonNode = ({ node, onDebugChange, staggerOffset = 0, hoveredMoonId, onMouseEnter, onMouseLeave }: SunMoonNodeProps) => {
  // --- Get relevant state and actions from the store ---
  const { currentLevel, zoomIn, setPanTarget, focusedMoonId } = useZoomStore();
  // --- Destructure node properties ---
  const { positions, role, title, subtitle, color } = node;

  // --- Derived state ---
  const isMoon = role === "moon";
  const currentPosition = positions[currentLevel];
  const isFocused = true; // Always show the focused state for L2 moons
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
  const moonCircleSize = isMoon ? CIRCLE_L1_SIZE : SUN_LARGE_SIZE;
  // Border width (shared)
  const circleBorderWidth = BORDER_WIDTH;
  // Text size (constant for moons)
  const moonTitleFontSize = "1.6rem";
  const moonSubtitleFontSize = "0.95rem";

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

  // Stagger the subtitle rotation for each moon by id (0ms, 200ms, 400ms)
  let subtitleDelay = 0;
  if (node.id === 'moon2') subtitleDelay = 200;
  if (node.id === 'moon3') subtitleDelay = 400;

  const isDimmed = hoveredMoonId && hoveredMoonId !== node.id;
  return (
    <motion.div
      layoutId={node.id}
      initial={false}
      animate={{
        x: currentPosition.x,
        y: currentPosition.y,
        opacity: isDimmed ? 0.45 : (currentLevel === "level1" || role === "moon"
          ? (currentLevel === "level2" && isMoon ? (isFocused ? 1 : 0.5) : 1)
          : 0),
        scale: tapAnim ? 1.15 : 1
      }}
      whileHover={isMoon ? { scale: 1.06 } : {}}
      transition={{
        x: { type: "spring", stiffness: 100, damping: 15, mass: 1, bounce: 0.2 },
        opacity: { type: "spring", stiffness: 100, damping: 15, mass: 1, bounce: 0.2 },
        scale: { type: "spring", stiffness: 300, damping: 20 }
      }}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        cursor: isMoon ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        mixBlendMode: isMoon ? 'screen' : undefined,
        pointerEvents: 'auto',
      }}
      data-zoom-moon={isMoon ? 'true' : undefined}
    >
      {/* Circle */}
      {isMoon && (
        <>
          <ArcProgressBar
            progress={typeof node.progress === 'number' ? node.progress : 0}
            radius={CIRCLE_L1_SIZE / 2}
            thickness={6}
            color="white"
            glowColor="rgba(255,255,255,0.18)"
            active={true}
            animationDuration={1.3}
            containerSize={CIRCLE_L1_SIZE + 40}
            onDebugChange={onDebugChange}
          />
          <MoonAnimatedBackground
            color={color}
            active={true}
            rotatingImageUrl="/moon-backgrounds/rotatingimage.png"
            size={CIRCLE_L1_SIZE}
            staggerOffset={staggerOffset}
          />
          {/*
            Text block for the moon node:
            - "QUEST" label (static)
            - Title (static)
            - RotatingSubtitle (cycles through recent actions, animated)
            This block is absolutely centered in the moon.
            The RotatingSubtitle is designed to be easily swappable for future data sources.
          */}
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
              justifyContent: "center",
              minWidth: '120px',
            }}
            initial={{
              top: CIRCLE_L1_SIZE / 2,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              top: CIRCLE_L1_SIZE / 2,
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
            <div
              style={{
                fontFamily: "'Sohne', sans-serif",
                fontWeight: 400,
                fontSize: "1.05rem",
                letterSpacing: "0.13em",
                color: "#888",
                textTransform: "uppercase",
                marginBottom: "0.7em",
                marginTop: "-0.2em",
                opacity: 0.85
              }}
            >
              QUEST
            </div>
            <motion.h3
              className="sunmoon-title"
              style={{
                margin: 0,
                fontSize: moonTitleFontSize,
                fontFamily: "'Ivar Headline', serif"
              }}
              animate={{
                scale: 1
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
            {/* RotatingSubtitle: cycles through recent actions for this moon. */}
            {Array.isArray(node.recentActions) && node.recentActions.length > 0 && (
              <RotatingSubtitle actions={node.recentActions} delay={subtitleDelay} dimmed={isDimmed} />
            )}
          </motion.div>
        </>
      )}
      <motion.div
        key={isMoon ? `moon-circle` : `sun-circle`}
        style={{
          borderRadius: "50%",
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          borderStyle: "solid",
          borderColor: isMoon ? hexToRgba(lightenColor(color, 60), 0.68) : "white",
          boxShadow: `0 0 32px 4px rgba(255, 255, 255, 0.18)`
        }}
        initial={{
          width: isMoon ? CIRCLE_L1_SIZE : SUN_LARGE_SIZE,
          height: isMoon ? CIRCLE_L1_SIZE : SUN_LARGE_SIZE,
          borderWidth: circleBorderWidth
        }}
        animate={{
          width: isMoon ? CIRCLE_L1_SIZE : SUN_LARGE_SIZE,
          height: isMoon ? CIRCLE_L1_SIZE : SUN_LARGE_SIZE,
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
    </motion.div>
  );
}; 