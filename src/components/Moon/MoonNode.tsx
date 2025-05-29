/*
  MoonNode.tsx
  -------------------
  This component renders a single moon node in the MoonVisualizer.
  It handles its own animation, scaling, opacity, and click behavior based on its state (focused, dot, or normal).

  HOW TO USE:
  - Used by MoonVisualizer to render each moon node.
  - Handles its own animation and click logic.
  - All moon appearance and interaction logic is contained here.

  WHAT IT HANDLES:
  - Animated position, scale, and opacity for each moon
  - Visual distinction between focused, dot, and normal moons
  - Uses Framer Motion for smooth transitions
*/

import { motion, AnimatePresence } from 'framer-motion';
import type { ZoomNode } from '../../types';
import React from 'react';
import { useJourneyModeStore } from '../../store/useJourneyModeStore';
import { MoonAnimatedBackground } from './MoonAnimatedBackground';
import { ArcProgressBar } from './ArcProgressBar';
import { SegmentedArcProgressBar } from './SegmentedArcProgressBar';
import { RotatingSubtitle } from './RotatingSubtitle';

// Props for the MoonNode component
interface MoonNodeProps {
  node: ZoomNode; // The moon node to render
  moonOrderIndex?: number; // 1-based index of the moon in the visualizer array
  staggerOffset?: number; // Optional: stagger animation offset in seconds
  hoveredMoonId?: string | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  mode?: 'overview' | 'detail';
  isFocused?: boolean;
  isDot?: boolean; // always boolean, never null/undefined
  targetX?: number;
  targetY?: number;
  targetScale?: number;
}

// Shared constants
const CIRCLE_L1_SIZE = 440;
// const SUN_LARGE_SIZE = 400; // Sun-specific constant removed
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
 * MoonNode
 * Renders a single moon node with animation and click logic.
 */
export const MoonNode = ({ node, moonOrderIndex, staggerOffset = 0, hoveredMoonId, onMouseEnter, onMouseLeave, mode = 'overview', isFocused = false, isDot = false, targetX, targetY, targetScale }: MoonNodeProps) => {
  const { setMode, setFocusedMoonIndex, scrollContainer, setIsAutoScrolling } = useJourneyModeStore();
  // --- Derived state ---
  const { positions, title, subtitle, color } = node; // Removed role as it's always 'moon'
  const currentLevel = 'level1'; // Maintained for position data structure
  // const isMoon = role === "moon"; // Removed as it's always true
  const currentPosition = {
    x: typeof targetX === 'number' ? targetX : positions[currentLevel].x,
    y: typeof targetY === 'number' ? targetY : positions[currentLevel].y,
  };
  const scale = typeof targetScale === 'number' ? targetScale : 1;
  const [tapAnim, setTapAnim] = React.useState(false);
  const [bgActive, setBgActive] = React.useState(false);
  // const [wasInLevel1, setWasInLevel1] = React.useState(true); // Not needed anymore
  const [arcActive, setArcActive] = React.useState(false);
  
  // Effect to handle focus changes for tap animation
  React.useEffect(() => {
    if (isFocused) {
      setTapAnim(true);
    } else {
      setTapAnim(false);
    }
  }, [isFocused]);

  // Delay activation of animated background after focusing
  React.useEffect(() => {
    if (isFocused) { // Simplified: only depends on isFocused
      setBgActive(true);
    } else {
      setBgActive(false);
    }
  }, [isFocused]);

  // Show arc with delay on focus
  React.useEffect(() => {
    if (isFocused) { // Simplified: only depends on isFocused
      const timeout = setTimeout(() => setArcActive(true), 600);
      return () => clearTimeout(timeout);
    } else {
      setArcActive(false);
    }
  }, [isFocused]);

  // --- Decoupled animation values for moons ---
  const moonCircleSize = CIRCLE_L1_SIZE; // Directly use moon size
  const circleBorderWidth = BORDER_WIDTH;
  const moonTitleFontSize = "1.6rem";
  const moonSubtitleFontSize = "0.95rem";

  const handleClick = () => {
    if (node.role === 'moon') {
      setMode('detail');
      if (moonOrderIndex) {
        setFocusedMoonIndex(moonOrderIndex);
      }

      if (scrollContainer && node.id) {
        const detailElement = document.getElementById(node.id);
        if (detailElement) {
          setIsAutoScrolling(true); // Set flag before starting scroll
          detailElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          console.log(`Scrolling to ${node.id}`);

          // Reset the flag after a delay (adjust duration as needed for smooth scroll)
          setTimeout(() => {
            setIsAutoScrolling(false);
          }, 1000); // 1 second, adjust if scroll takes longer/shorter
        } else {
          console.warn(`Detail element with ID ${node.id} not found for scrolling.`);
        }
      }
    }
  };

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
        opacity: isDimmed ? 0.45 : 1,
        scale: scale
      }}
      whileHover={!Boolean(isDot) ? { scale: scale * 1.06 } : {}}
      transition={{
        x: { type: "spring", stiffness: 80, damping: 18, mass: 1, bounce: 0.2 },
        opacity: { type: "spring", stiffness: 80, damping: 18, mass: 1, bounce: 0.2 },
        scale: { type: "spring", stiffness: 240, damping: 24 }
      }}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        cursor: "pointer", // Moons are always clickable
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        mixBlendMode: 'screen', // Moons always use screen blend mode
        pointerEvents: 'auto',
      }}
      data-moon-node='true' // Simplified data attribute
    >
      {/* Moon Container - This is the primary content now */}
      <motion.div
        style={{
          position: "relative",
          width: CIRCLE_L1_SIZE,
          height: CIRCLE_L1_SIZE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: Boolean(isDot) ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <ArcProgressBar
            progress={Boolean(isDot) ? 0 : (typeof node.progress === 'number' ? node.progress : 0)}
            radius={CIRCLE_L1_SIZE / 2}
            thickness={6}
            color="white"
            glowColor="rgba(255,255,255,0.18)"
            active={true} // Arc is always active for moons, appearance controlled by opacity/progress
            animationDuration={1.3}
            containerSize={CIRCLE_L1_SIZE + 40}
          />
        </motion.div>

        {/* Animated Background */}
        <MoonAnimatedBackground
          color={color}
          active={true} // Background is always active for moons
          rotatingImageUrl="/moon-backgrounds/rotatingimage.png"
          size={CIRCLE_L1_SIZE}
          staggerOffset={staggerOffset}
          hideRotatingImage={Boolean(isDot)}
          hideRotatingImageDelay={Boolean(isDot) ? 0.22 : 0}
        />

        {/* Border Circle */}
        <motion.div
          style={{
            position: "absolute",
            width: CIRCLE_L1_SIZE,
            height: CIRCLE_L1_SIZE,
            borderRadius: "50%",
            border: `${BORDER_WIDTH}px solid ${hexToRgba(lightenColor(color, 60), 0.68)}`,
            boxShadow: `0 0 32px 4px rgba(255, 255, 255, 0.18)`,
            backgroundColor: "transparent",
          }}
        />

        {/* Text Content */}
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
            opacity: Boolean(isDot) ? 0 : 1
          }}
          animate={{
            top: CIRCLE_L1_SIZE / 2,
            transform: 'translate(-50%, -50%)',
            opacity: Boolean(isDot) ? 0 : 1
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            mass: 1,
            bounce: 0.2,
            opacity: { duration: 0.08 }
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
            className="moon-title" // Changed class name
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
          {Array.isArray(node.recentActions) && node.recentActions.length > 0 && (
            <RotatingSubtitle actions={node.recentActions} delay={subtitleDelay} dimmed={Boolean(isDimmed)} />
          )}
        </motion.div>
      </motion.div>
      {/* Sun Circle specific rendering removed */}
    </motion.div>
  );
}; 