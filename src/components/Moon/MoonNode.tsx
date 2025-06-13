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
import { RotatingSubtitle } from './RotatingSubtitle';
import { detailScreenTypes } from '../Layout/detailScreenTypes';

// Props for the MoonNode component
interface MoonNodeProps {
  node: ZoomNode; // The moon node to render
  moonOrderIndex?: number; // 1-based index of the moon in the visualizer array
  staggerOffset?: number; // Optional: stagger animation offset in seconds
  hoveredMoonId?: string | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isFocused?: boolean;
  isDot?: boolean; // always boolean, never null/undefined
  targetX?: number;
  targetY?: number;
  targetScale?: number;
  targetOpacity?: number; // Add opacity prop
}

// Shared constants
const CIRCLE_L1_SIZE = 440;
// const SUN_LARGE_SIZE = 400; // Sun-specific constant removed
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
 * @component MoonNode
 * @description This component serves as the primary renderer and state controller for a single moon element
 * within the application's visualization. It is a highly stateful and animated component that encapsulates
 * all the logic for a moon's appearance, interaction, and transition between different states (e.g.,
 * from being part of the overview to being the 'focused' moon in the detail view).
 *
 * It combines several sub-components to build the complete visual:
 *  - `motion.div`: The root element from Framer Motion, handling all positional, scaling, and opacity animations.
 *  - `MoonAnimatedBackground`: A dynamic, decorative background that activates when the moon is focused.
 *  - `ArcProgressBar`: The circular progress bar that displays the completion of the associated goal.
 *  - `RotatingSubtitle`: An animated subtitle that provides context for the moon's current progress phase.
 *
 * The component's behavior is heavily dictated by props passed down from its parent (`MoonVisualizer`),
 * such as `isFocused`, `isDot`, `targetX`, `targetY`, and `targetScale`. These props determine whether the moon
 * should render as a large, interactive element, a small, passive dot, or something in between, and
 * control its position and size on the screen, allowing for the complex choreographed animations between
 * different states.
 *
 * Renders a single moon node with animation and click logic.
 */
export const MoonNode = ({ node, moonOrderIndex, staggerOffset = 0, hoveredMoonId, onMouseEnter, onMouseLeave, isFocused = false, isDot = false, targetX, targetY, targetScale, targetOpacity }: MoonNodeProps) => {
  const { setMode, setFocusedMoonIndex, scrollContainer, setIsAutoScrolling } = useJourneyModeStore();
  const isCutsceneActive = useJourneyModeStore(s => s.isCutsceneActive);
  const pulseMoons = useJourneyModeStore(s => s.pulseMoons);
  const resetMoonPulse = useJourneyModeStore(s => s.resetMoonPulse);
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
  
  // Pulse animation state (store-driven)
  const [pulse, setPulse] = React.useState(false);

  // Use a longer animation duration for progress boost during cutscene
  const progressBarAnimationDuration = isCutsceneActive ? 1.5 : 1.3;

  /**
   * Store-Driven Pulse Animation
   * ----------------------------
   * This effect listens for a global state change (`pulseMoons` from the Zustand store) to trigger a
   * visual "pulse" animation on a specific moon. This is an example of externally controlled animation,
   * where another part of the app (e.g., a cutscene or a summary screen) can command a moon to highlight
   * itself without direct prop drilling.
   *
   * When the `pulseMoons` store state indicates this moon's ID should pulse, the local `pulse` state is
   * set to true, triggering a CSS animation. A timeout is then set to turn the pulse off and reset the
   * state in the global store, effectively making it a single-shot animation per trigger.
   */
  React.useEffect(() => {
    if (pulseMoons[node.id]) {
      setPulse(true);
      // Reset the store pulse after animation
      const t = setTimeout(() => {
        setPulse(false);
        resetMoonPulse(node.id);
      }, 320);
      return () => clearTimeout(t);
    }
  }, [pulseMoons, node.id, resetMoonPulse]);

  /**
   * Staged Animation on Focus
   * -------------------------
   * This series of `useEffect` hooks creates a choreographed animation sequence when a moon becomes the `isFocused`
   * element in the detail view. Instead of everything happening at once, these effects manage local state
   * (`tapAnim`, `bgActive`, `arcActive`) with deliberate timing to create a more polished visual experience.
   *
   * 1. `tapAnim` (Immediate): A visual effect on the moon's border/background is triggered instantly.
   * 2. `bgActive` (Immediate): The animated, decorative background (`MoonAnimatedBackground`) is activated.
   * 3. `arcActive` (Delayed): The `ArcProgressBar` is faded in after a 600ms delay. This slight pause ensures
   *    the moon has finished its main positional and scaling animation, so the progress bar appears smoothly
   *    on a stable element rather than animating in while the moon itself is still in motion.
   *
   * When `isFocused` becomes false, all these states are reset, hiding the decorative elements.
   */
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

  /**
   * Click Interaction Handler
   * -------------------------
   * This function defines the core user interaction for a moon in the overview. When a moon is clicked,
   * it orchestrates the transition from the 'overview' mode to the 'detail' mode, with this moon as the
   * central focus.
   *
   * The process involves several steps:
   * 1. Set Global Mode: It calls `setMode('detail')` on the global store.
   * 2. Set Focused Moon: It informs the store which moon to focus on by calling `setFocusedMoonIndex`
   *    with its own `moonOrderIndex` (a 1-based index). This allows the `MoonVisualizer` to calculate
   *    the correct positions for all moons in the detail view.
   * 3. Scroll to Detail Card: It finds the first content card associated with this moon in the DOM
   *    (based on the `detailScreenTypes` configuration) and programmatically scrolls the main container
   *    to bring that card into view. An `isAutoScrolling` flag is used to temporarily disable
   *    user-scroll-based mode changes during this automated scroll.
   */
  const handleClick = () => {
    if (node.role === 'moon') {
      setMode('detail');
      if (moonOrderIndex) {
        setFocusedMoonIndex(moonOrderIndex);
      }

      if (scrollContainer && node.id) {
        // Dynamically find the first detail screen key
        const firstScreenKey = detailScreenTypes[0]?.key;
        const firstCardKey = `${node.id}-${firstScreenKey}`;
        const firstCardElement = document.querySelector(`[data-card-key="${firstCardKey}"]`);
        
        if (firstCardElement) {
          setIsAutoScrolling(true);
          firstCardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          console.log(`Scrolling to first card of ${node.id}`);

          setTimeout(() => {
            setIsAutoScrolling(false);
          }, 1000);
        } else {
          console.warn(`First detail card for moon ${node.id} not found for scrolling.`);
        }
      }
    }
  };

  let subtitleDelay = 0;
  if (node.id === 'moon2') subtitleDelay = 200;
  if (node.id === 'moon3') subtitleDelay = 400;

  const isDimmed = hoveredMoonId !== null && hoveredMoonId !== node.id;
  
  /**
   * Framer Motion Animation & Layout
   * --------------------------------
   * This `motion.div` is the core animated container for the entire MoonNode. It uses Framer Motion's `layoutId`
   * prop, which allows Framer to recognize this moon as the same element across different renders, enabling
   * smooth "magic motion" transitions between the overview and detail layouts.
   *
   * - `animate`: This prop drives the primary animation. The `x`, `y`, `opacity`, and `scale` values are calculated
   *   based on the component's state (e.g., `isFocused`, `isDimmed`). When these target values change, Framer Motion
   *   animates the component from its old state to the new one.
   * - `whileHover`: Provides a simple, declarative way to add interactivity, scaling the moon up slightly
   *   when the user hovers over it. This is disabled during cutscenes or when the moon is a 'dot'.
   * - `transition`: This is key to the component's feel. It specifies the physics of the animation, using a `spring`
   *   model with defined `stiffness`, `damping`, and `mass`. This is what gives the moons their characteristic
   *   fluid, slightly bouncy movement, which feels more natural than a simple linear timing function.
   * - `onClick`, `onMouseEnter`, `onMouseLeave`: These handlers are wired up to the component's interaction logic,
   *   but are disabled during cutscenes to prevent user interference.
   */
  const animationProps = {
    x: currentPosition.x,
    y: currentPosition.y,
    scale: scale,
    opacity: targetOpacity ?? (isDot ? 0.7 : 1),
  };

  const handleTap = () => {
    if (node.role === 'moon') {
      setMode('detail');
      if (moonOrderIndex) {
        setFocusedMoonIndex(moonOrderIndex);
      }

      if (scrollContainer && node.id) {
        // Dynamically find the first detail screen key
        const firstScreenKey = detailScreenTypes[0]?.key;
        const firstCardKey = `${node.id}-${firstScreenKey}`;
        const firstCardElement = document.querySelector(`[data-card-key="${firstCardKey}"]`);
        
        if (firstCardElement) {
          setIsAutoScrolling(true);
          firstCardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          console.log(`Scrolling to first card of ${node.id}`);

          setTimeout(() => {
            setIsAutoScrolling(false);
          }, 1000);
        } else {
          console.warn(`First detail card for moon ${node.id} not found for scrolling.`);
        }
      }
    }
  };

  return (
    <motion.div
      layoutId={node.id}
      key={node.id}
      data-moon-node={true}
      className={`moon-node-container ${pulse ? 'pulse' : ''}`}
      style={{
        position: 'absolute',
        width: moonCircleSize,
        height: moonCircleSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        cursor: isDot ? 'default' : 'pointer',
        pointerEvents: isCutsceneActive ? 'none' : 'auto',
      }}
      initial={false} // Prevent initial animation on load
      animate={animationProps}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      whileHover={!isCutsceneActive && !Boolean(isDot) ? { scale: scale * 1.06 } : {}}
      onTap={handleTap}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Pulse effect overlay */}
      <motion.div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 2,
          background: 'radial-gradient(circle, rgba(255,241,200,0.7) 0%, rgba(255,241,200,0.12) 85%, rgba(255,241,200,0) 100%)',
        }}
        animate={{
          opacity: pulse ? 1 : 0,
          scale: pulse ? 1.32 : 1,
        }}
        transition={{
          opacity: { duration: 0.18 },
          scale: { duration: 0.32, type: 'spring', stiffness: 300, damping: 18 },
        }}
      />
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
        animate={{
          scale: pulse ? 1.10 : 1
        }}
        transition={{
          scale: { duration: 0.32, type: 'spring', stiffness: 300, damping: 18 },
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
            color={lightenColor(color, 70)}
            baseColor={color}
            glowColor={hexToRgba(color, 0.25)}
            active={true}
            animationDuration={progressBarAnimationDuration}
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
            border: `${BORDER_WIDTH}px solid ${hexToRgba(lightenColor(color, 60), 0.35)}`,
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
            top: CIRCLE_L1_SIZE / 2 + (isCutsceneActive ? 38 : 0),
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
            TRACK
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
          {Array.isArray(node.goals) && node.goals.length > 0 && (
            <RotatingSubtitle actions={node.goals.filter(g => g.status === 'active').map(g => `Active Goal: ${g.title}`)} delay={subtitleDelay} dimmed={Boolean(isDimmed)} />
          )}
        </motion.div>
      </motion.div>
      {/* Sun Circle specific rendering removed */}
    </motion.div>
  );
}; 