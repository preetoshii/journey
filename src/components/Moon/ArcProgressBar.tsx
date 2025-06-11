/*
  ArcProgressBar.tsx
  -------------------
  This component renders a circular progress bar with an optional animated head and glow effect.
  It is highly customizable through props, allowing control over progress, radius, thickness, colors,
  animation duration, and more.

  KEY FEATURES:
  - Animates progress changes smoothly using Framer Motion.
  - Supports an optional "head" element that moves along the arc.
  - Includes a glow effect for the arc.
  - Handles initial animation from 0% on first activation.
  - Allows customization of arc radius, thickness, colors, and animation speed.
  - SVG-based for scalability and crisp rendering.

  HOW IT WORKS:
  - The component calculates the SVG arc path using helper functions (`polarToCartesian`, `describeArc`).
  - Framer Motion is used to animate the `progress` prop, creating a smooth visual effect.
  - The arc and an optional head element are rendered as SVG elements.
  - It manages an `isFirstActivation` state to ensure the initial animation from 0% occurs correctly.

  USAGE:
  - Typically used as a visual indicator of progress within circular UI elements (e.g., moons).
  - Import and use within other React components, providing the necessary props.

  HELPER FUNCTIONS:
  - `polarToCartesian`: Converts polar coordinates to Cartesian coordinates for SVG path calculations.
  - `describeArc`: Generates the SVG `d` attribute string for drawing the arc.
  - `lightenColor`: Lightens a hex color by a specified amount.
  - `hexToRgba`: Converts a hex color to rgba with a specified alpha value.
  - `darkenColor`: Darkens a hex color by a specified amount.
  - `mixWithBlack`: Mixes a hex color with black by a given percentage.
*/

import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ArcProgressBarProps {
  progress: number; // 0-100
  radius: number; // arc radius
  thickness: number;
  color: string;
  baseColor?: string;
  glowColor?: string;
  head?: React.ReactNode;
  active: boolean;
  animationDuration?: number; // seconds
  containerSize?: number; // SVG size (default 750)
}


/**
 * Converts polar coordinates (radius, angle) to Cartesian coordinates (x, y).
 * This is a utility function used to calculate points on the circumference of a circle,
 * which is essential for drawing arcs and positioning elements along the arc.
 *
 * @param cx - The x-coordinate of the circle's center.
 * @param cy - The y-coordinate of the circle's center.
 * @param r - The radius of the circle.
 * @param angle - The angle in radians.
 * @returns An object with `x` and `y` Cartesian coordinates.
 */
// Helper: Convert polar to cartesian


function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}



/**
 * Generates the SVG path string for an arc.
 * This function constructs the `d` attribute for an SVG `<path>` element to draw a circular arc.
 * It takes into account the center coordinates, radius, start and end angles,
 * and uses these to calculate the start and end points of the arc.
 * The `largeArcFlag` and `sweepFlag` parameters control how the arc is drawn between these points.
 *
 * @param cx - The x-coordinate of the arc's center.
 * @param cy - The y-coordinate of the arc's center.
 * @param r - The radius of the arc.
 * @param startAngle - The starting angle of the arc in radians.
 * @param endAngle - The ending angle of the arc in radians.
 * @param progress - The progress percentage (0-100), used to determine the `largeArcFlag`.
 * @param sweepFlag - The sweep flag for the SVG arc path (0 for counter-clockwise, 1 for clockwise).
 * @returns A string representing the SVG path data for the arc.
 */
// Helper: Describe SVG arc path
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number, progress: number, sweepFlag: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = progress > 50 ? 1 : 0;
  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, sweepFlag, end.x, end.y
  ].join(" ");
}




/**
 * @component ArcProgressBar
 * @description Renders a circular progress bar with customizable appearance and animations.
 *
 * This component visualizes progress as an arc of a circle. It uses Framer Motion to animate
 * the progress value, providing a smooth transition when the progress changes.
 * It supports features like a "head" element that moves along the arc, a glow effect,
 * and customizable colors, thickness, and radius.
 *
 * The arc starts from the bottom (90 degrees or Math.PI / 2 radians) and progresses clockwise.
 *
 * Props:
 *  - `progress`: The current progress value (0-100).
 *  - `radius`: The radius of the arc.
 *  - `thickness`: The thickness of the arc line.
 *  - `color`: The main color of the arc.
 *  - `baseColor`: (Optional) The base color for the dotted line.
 *  - `glowColor`: (Optional) The color of the glow effect around the arc. Defaults to a semi-transparent white.
 *  - `head`: (Optional) A React node to be used as the "head" of the progress bar, moving along the arc.
 *            If not provided, a default pulsating circle head is rendered.
 *  - `active`: A boolean indicating whether the progress bar should be visible and animating.
 *              When `false`, the arc and head are hidden, and progress animates to 0.
 *  - `animationDuration`: (Optional) The duration of the progress animation in seconds. Defaults to 1.3 seconds.
 *  - `containerSize`: (Optional) The size of the square SVG container. Defaults to 750.
 *
 * State and Effects:
 *  - `isFirstActivation`: Tracks if the component is being activated for the first time to handle initial animation from 0.
 *  - `progressMotion`: A Framer Motion `MotionValue` used to animate the progress.
 *  - `spring`: A Framer Motion spring animation applied to `progressMotion`.
 *  - `animatedProgress`: The current animated progress value derived from the spring.
 *  - `arcPaths`: A memoized array of SVG path objects for the arc segments.
 *  - `headPos`: A memoized object containing the x and y coordinates for the head element, recalculated when `animatedProgress` changes.
 *
 * The component uses `useEffect` hooks to manage the animation lifecycle based on the `active` prop and `progress` changes.
 * The head element is cloned and positioned if it's a simple SVG shape like 'circle' or 'ellipse'; otherwise, it's wrapped in a 'g' element and transformed.
 */


export const ArcProgressBar: React.FC<ArcProgressBarProps> = ({
  progress,
  radius,
  thickness,
  color,
  baseColor,
  glowColor = "rgba(255,255,255,0.18)",
  head,
  active,
  animationDuration = 1.3,
  containerSize = 750,
}) => {
  const center = containerSize / 2;
  const startAngle = Math.PI / 2; // 90deg, bottom

  // --- Dotted Line Logic ---
  const [dottedLinePath, setDottedLinePath] = React.useState('');

  React.useEffect(() => {
    const sections = [
      { start: Math.PI / 2, end: (7 * Math.PI) / 6, min: 0, max: 33.33 },
      { start: (7 * Math.PI) / 6, end: (11 * Math.PI) / 6, min: 33.33, max: 66.66 },
      { start: (11 * Math.PI) / 6, end: (Math.PI / 2) + (2 * Math.PI), min: 66.66, max: 100.01 },
    ];

    const currentSection = sections.find(s => progress >= s.min && progress < s.max);

    if (currentSection) {
      // Use dummy progress < 50 to ensure largeArcFlag is 0 for our 120deg segments
      const path = describeArc(center, center, radius, currentSection.start, currentSection.end, 1, 1);
      setDottedLinePath(path);
    } else {
      setDottedLinePath('');
    }
  }, [progress, center, radius]);
  // --- End Dotted Line Logic ---

  // Track if this is the first time becoming active
  const [isFirstActivation, setIsFirstActivation] = React.useState(true);



  /**
   * Effect to manage the `isFirstActivation` state.
   * Resets `isFirstActivation` to `true` when the component becomes inactive,
   * and sets it to `false` on the first activation. This ensures that the
   * "animate from zero" behavior only happens on the initial display or
   * after being re-activated from an inactive state.
   */


  React.useEffect(() => {
    if (active && isFirstActivation) {
      setIsFirstActivation(false);
    } else if (!active) {
      setIsFirstActivation(true);
    }
  }, [active]);

  const effectiveProgress = progress;

  // Animate progress with Framer Motion
  const progressMotion = useMotionValue(isFirstActivation ? 0 : effectiveProgress);
  const spring = useSpring(progressMotion, { 
    duration: animationDuration, 
    damping: 20, 
    stiffness: 120 
  });



  /**
   * Effect to update the `progressMotion` value when `effectiveProgress` or `active` state changes.
   * If the component is active:
   *  - On first activation, it sets the motion value to 0 and then animates to `effectiveProgress` after a delay.
   *    This delay allows other entry animations (like a moon growing) to complete first.
   *  - On subsequent updates while active, it directly sets the motion value to `effectiveProgress`.
   */


  React.useEffect(() => {
    if (active) {
      // If it's first activation, animate from 0 to target
      if (isFirstActivation) {
        progressMotion.set(0);
        setTimeout(() => {
          progressMotion.set(effectiveProgress);
        }, 400); // Increased delay to start after growth animation
      } else {
        progressMotion.set(effectiveProgress);
      }
    }
  }, [effectiveProgress, active, progressMotion, isFirstActivation]);

  // Derived animated progress value
  const [animatedProgress, setAnimatedProgress] = React.useState(effectiveProgress);



  /**
   * Effect to subscribe to changes in the `spring` animation and update `animatedProgress`.
   * If the component is not `active`, `animatedProgress` is set to 0.
   * Otherwise, it reflects the current value of the spring animation.
   * The subscription is cleaned up when the component unmounts or dependencies change.
   */


  React.useEffect(() => {
    if (!active) return setAnimatedProgress(0);
    setAnimatedProgress(spring.get());
    const unsubscribe = spring.on("change", setAnimatedProgress);
    return unsubscribe;
  }, [active, spring]);




  /**
   * Memoized calculation of the SVG arc path string.
   * This path is only recalculated if `active`, `animatedProgress`, `center`, `radius`, or `startAngle` changes.
   * Returns an empty string if not active or progress is zero, effectively hiding the arc.
   * The arc is drawn clockwise from `startAngle` to an `endAngle` determined by `animatedProgress`.
   */
  // Arc path as a derived value (always from start to animatedProgress)


  const arcData = React.useMemo(() => {
    const paths = [];
    const completedColor = color; // The "slightly lightened" color
    const activeColor = lightenColor(baseColor || color, 120); // The "fully lightened" (almost white) color
    
    const completedGlow = glowColor;
    const activeGlow = lightenColor(baseColor || color, 120, 0.5);

    const sectionDefs = [
      { start: Math.PI / 2, end: (7 * Math.PI) / 6, threshold: 33.33 },
      { start: (7 * Math.PI) / 6, end: (11 * Math.PI) / 6, threshold: 66.66 },
      { start: (11 * Math.PI) / 6, end: (Math.PI / 2) + (2 * Math.PI), threshold: 100 },
    ];

    let remainingProgress = animatedProgress;
    const gapSize = 0.075; // Size of the gap in radians (about 4.5 degrees)

    for (const section of sectionDefs) {
      if (remainingProgress <= 0) break;

      const sectionLength = section.threshold - (sectionDefs.indexOf(section) > 0 ? sectionDefs[sectionDefs.indexOf(section) - 1].threshold : 0);
      const progressInSection = Math.min(remainingProgress, sectionLength);
      
      const isCompleted = remainingProgress > sectionLength;
      const finalColor = isCompleted ? completedColor : activeColor;
      const finalGlow = isCompleted ? completedGlow : activeGlow;

      const angleRatio = progressInSection / sectionLength;
      // Add gap at the end of each section except the last one
      const endAngle = section.start + (section.end - section.start - (section.threshold < 100 ? gapSize : 0)) * angleRatio;
      
      paths.push({
        d: describeArc(center, center, radius, section.start, endAngle, 1, 1),
        color: finalColor,
        glowColor: finalGlow,
        key: `arc-section-${section.threshold}`
      });

      remainingProgress -= sectionLength;
    }

    const headColor = paths.length > 0 ? paths[paths.length - 1].color : completedColor;
    const headGlowColor = paths.length > 0 ? paths[paths.length - 1].glowColor : completedGlow;

    return { paths, headColor, headGlowColor };
  }, [animatedProgress, center, radius, color, baseColor, glowColor]);



  /**
   * Memoized calculation of the position for the "head" element along the arc.
   * This position is only recalculated if `active`, `animatedProgress`, `center`, `radius`, or `startAngle` changes.
   * If not active, the head is positioned at the center (though it will likely be hidden).
   * The position corresponds to the end point of the current `animatedProgress` on the arc.
   */
  // Head position as a derived value (clockwise)

  
  const headPos = React.useMemo(() => {
    if (!active) return { x: center, y: center };
    const endAngle = startAngle + (2 * Math.PI * (animatedProgress / 100));
    return polarToCartesian(center, center, radius, endAngle);
  }, [active, animatedProgress, center, radius, startAngle]);

  // Helper to lighten a hex color
  function lightenColor(hex: string, amount: number, alpha?: number) {
    let col = hex.replace('#', '');
    if (col.length === 3) col = col.split('').map(x => x + x).join('');
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    const newHex = `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    if (typeof alpha === 'number') {
      return hexToRgba(newHex, alpha);
    }
    return newHex;
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

  // Helper to darken a hex color
  function darkenColor(hex: string, amount: number) {
    let col = hex.replace('#', '');
    if (col.length === 3) col = col.split('').map(x => x + x).join('');
    const num = parseInt(col, 16);
    let r = (num >> 16) - amount;
    let g = ((num >> 8) & 0x00FF) - amount;
    let b = (num & 0x0000FF) - amount;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  // Helper to mix a hex color with black by a given percentage (amount: 0 = original, 1 = black)
  function mixWithBlack(hex: string, amount: number) {
    let col = hex.replace('#', '');
    if (col.length === 3) col = col.split('').map(x => x + x).join('');
    const num = parseInt(col, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    r = Math.round(r * (1 - amount));
    g = Math.round(g * (1 - amount));
    b = Math.round(b * (1 - amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  return (
    <svg
      width={containerSize}
      height={containerSize}
      viewBox={`0 0 ${containerSize} ${containerSize}`}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {/* Dotted section line */}
      {active && dottedLinePath && (
        <path
          d={dottedLinePath}
          stroke={baseColor || color}
          strokeWidth={thickness * 0.8}
          strokeDasharray={`1 ${thickness * 2}`}
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* Glow */}
      {active && arcData.paths.map(path => (
        <React.Fragment key={path.key}>
          {/* Glow */}
          <motion.path
            d={path.d}
            stroke={path.glowColor}
            initial={{ strokeWidth: 0 }}
            animate={{ strokeWidth: thickness * 2.2 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            fill="none"
            style={{ filter: `blur(6px)` }}
          />
          {/* Main arc */}
          <motion.path
            d={path.d}
            stroke={path.color}
            initial={{ strokeWidth: 0 }}
            animate={{ strokeWidth: thickness }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            fill="none"
            strokeLinecap="round"
          />
        </React.Fragment>
      ))}
      
      {/* Checkpoints (Removed) */}
      
      {/* Head */}
      {active && arcData.paths.length > 0 && (
        head && React.isValidElement(head)
          ? (typeof head.type === 'string' && (head.type === 'circle' || head.type === 'ellipse')
              ? React.cloneElement(head as React.ReactElement<any>, {
                  cx: headPos.x,
                  cy: headPos.y,
                })
              : <g transform={`translate(${headPos.x},${headPos.y})`}>{head}</g>
            )
          : (
            <motion.circle
              cx={headPos.x}
              cy={headPos.y}
              initial={{ r: 0 }}
              animate={{ r: [thickness * 1.8, thickness * 2.2, thickness * 1.8] }}
              transition={{
                duration: 1.8,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
              }}
              fill={arcData.headColor}
              style={{ filter: `drop-shadow(0 0 8px ${arcData.headGlowColor})` }}
            />
          )
      )}
    </svg>
  );
}; 