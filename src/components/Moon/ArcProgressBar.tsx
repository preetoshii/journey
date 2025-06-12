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

  /**
   * Dotted Section Line
   * -------------------
   * This block of logic is responsible for rendering the static, dotted line that indicates the current 120-degree
   * "section" the user's progress falls within. It does not animate with the progress bar itself, but instead
   * instantly appears, providing a subtle, fixed guide for the current phase of progress.
   *
   * It works by defining the three sections of the circle, each spanning 120 degrees (e.g., 0-33%, 33-66%, 66-100%).
   * A `useEffect` hook determines which of these sections the current `progress` prop falls into. Once the
   * current section is identified, it generates the corresponding SVG arc path data using the `describeArc`
   * helper. This path data is then stored in the `dottedLinePath` state and rendered as a separate, styled
   * <path> element in the SVG, using the moon's base color and a dash array to create the dotted effect.
   * If the progress is at a boundary where no section is active (e.g., exactly 0 or 100), the path is cleared.
   */
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

  /**
   * Initial Animation and State Management
   * --------------------------------------
   * This section manages the component's activation state to ensure animations behave correctly,
   * especially on the first appearance. The `isFirstActivation` state flag is crucial for the "load-in"
   * animation, where the progress bar animates from 0 up to its initial value.
   *
   * A `useEffect` hook watches the `active` prop. When the component becomes inactive, it resets
   * `isFirstActivation` to `true`. When it becomes active for the first time after that reset, the
   * flag is set to `false`. This cycle ensures that the entry animation can be re-triggered if the
   * component is hidden and then shown again, providing a consistent user experience.
   */
  const [isFirstActivation, setIsFirstActivation] = React.useState(true);

  React.useEffect(() => {
    if (active && isFirstActivation) {
      setIsFirstActivation(false);
    } else if (!active) {
      setIsFirstActivation(true);
    }
  }, [active]);

  const effectiveProgress = progress;

  /**
   * Core Progress Animation
   * -----------------------
   * This is where the primary animation for the progress bar is defined using Framer Motion's `useSpring`.
   * It takes the raw `progress` value and creates a smoothed, physically-simulated `animatedProgress`
   * value that provides a more natural and fluid motion.
   *
   * 1. `progressMotion`: A `MotionValue` is initialized. If it's the component's first activation,
   *    it starts at 0 to ensure the bar animates from the beginning. Otherwise, it starts at the
   *    current `effectiveProgress`.
   * 2. `spring`: The `useSpring` hook is applied to `progressMotion`. This creates the physics-based
   *    animation, where properties like `damping` and `stiffness` can be tweaked to change the feel
   *    of the animation (e.g., how much it "bounces" or overshoots).
   * 3. `useEffect` (on `effectiveProgress`): This hook is the trigger. When the `progress` prop changes,
   *    it updates the target of the `progressMotion` value, causing the spring animation to start moving
   *    towards the new value. It includes a delay on first activation to allow other UI elements
   *    (like the moon itself) to complete their entry animations first.
   * 4. `useEffect` (on `spring`): This hook subscribes to the `onChange` event of the `spring`. As the
   *    spring animates, it continuously updates the `animatedProgress` state variable. This derived
   *    state is what is actually used to draw the visible arc, ensuring the SVG path is redrawn
   *    on every frame of the animation.
   */
  const progressMotion = useMotionValue(isFirstActivation ? 0 : effectiveProgress);
  const spring = useSpring(progressMotion, { 
    duration: animationDuration, 
    damping: 20, 
    stiffness: 120 
  });

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

  React.useEffect(() => {
    if (!active) return setAnimatedProgress(0);
    setAnimatedProgress(spring.get());
    const unsubscribe = spring.on("change", setAnimatedProgress);
    return unsubscribe;
  }, [active, spring]);

  /**
   * Multi-Part Arc Path Generation
   * ------------------------------
   * This is the core rendering logic that creates the sophisticated, multi-segment appearance of the progress bar.
   * Instead of drawing a single arc, it calculates and generates an array of separate arc path objects, each
   * with its own color, glow, and styling. This allows for the dynamic visual distinction between "completed"
   * sections and the "active" section of the progress.
   *
   * The logic, wrapped in a `useMemo` for performance, iterates through the predefined section definitions.
   * For each section, it determines if the `animatedProgress` has fully passed it or is currently within it.
   * - If a section is complete, it's assigned the standard "slightly lightened" color.
   * - If a section is the active one, it's assigned the "fully lightened" (almost white) color and a more
   *   prominent glow, making it the clear focal point.
   *
   * It also calculates the small `gapSize` between segments by slightly shortening the end angle of each arc,
   * creating the visual separation that defines the sections. The final output is an `arcData` object
   * containing an array of path data (`paths`) and the correct color for the moving head (`headColor` and `headGlowColor`),
   * which is derived from the very last segment in the `paths` array.
   */
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
    const gapSize = 0.03; // Size of the gap in radians (about 1.7 degrees)

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
   * Progress Head Positioning
   * -------------------------
   * This `useMemo` hook is dedicated to calculating the precise (x, y) coordinates for the moving "head"
   * of the progress bar. The head is the circular element that travels along the leading edge of the arc.
   *
   * It takes the linear `animatedProgress` value (from 0 to 100) and translates it into an angular position
   * on the circular path. This is done by converting the progress percentage into a corresponding angle in
   * radians and then using the `polarToCartesian` helper function to get the final SVG coordinates.
   * This calculation is memoized, so it only runs when `animatedProgress` changes, ensuring efficient
   * updates during the animation. The resulting `headPos` object is used to position the head element in the SVG.
   */
  const headPos = React.useMemo(() => {
    if (!active) return { x: center, y: center };
    const endAngle = startAngle + (2 * Math.PI * (animatedProgress / 100));
    return polarToCartesian(center, center, radius, endAngle);
  }, [active, animatedProgress, center, radius, startAngle]);

  /**
   * Color Manipulation Utilities
   * ----------------------------
   * This collection of helper functions provides the necessary tools for dynamic color styling throughout the component.
   * They are defined directly within the component as they are closely tied to its rendering logic and are not
   * needed elsewhere in the application. This co-location makes the component more self-contained.
   *
   * - `lightenColor`: Increases the brightness of a hex color, used for the main progress arc and the active section highlight.
   * - `hexToRgba`: Converts a hex color string into an `rgba()` string with a specified alpha (transparency),
   *   used for creating glow and border effects.
   * - `darkenColor` & `mixWithBlack`: These are used for creating the dark, subtle borders on the inactive checkpoints,
   *   providing different methods of achieving a darker shade.
   */
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
      {arcData.paths.map((path, index) => (
        <React.Fragment key={path.key}>
          {/* Glow */}
          {path.glowColor && (
            <motion.path
              d={path.d}
              stroke={path.glowColor}
              initial={{ strokeWidth: 0 }}
              animate={{ strokeWidth: thickness * 2.2 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              fill="none"
              style={{ filter: `blur(6px)` }}
            />
          )}
          {/* Main arc */}
          <motion.path
            d={path.d}
            stroke={path.color}
            initial={{ strokeWidth: 0 }}
            animate={{ strokeWidth: thickness }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            fill="none"
            strokeLinecap={index === 0 ? 'round' : 'butt'}
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