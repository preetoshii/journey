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
*/

import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ArcProgressBarProps {
  progress: number; // 0-100
  radius: number; // arc radius
  thickness: number;
  color: string;
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
 *  - `arcPath`: A memoized SVG path string for the arc, recalculated when `animatedProgress` or other relevant props change.
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
  glowColor = "rgba(255,255,255,0.18)",
  head,
  active,
  animationDuration = 1.3,
  containerSize = 750,
}) => {
  const center = containerSize / 2;
  const startAngle = Math.PI / 2; // 90deg, bottom

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


  const arcPath = React.useMemo(() => {
    if (!active || animatedProgress <= 0) return "";
    const endAngle = startAngle + (2 * Math.PI * (animatedProgress / 100));
    const largeArcFlag = animatedProgress > 50 ? 1 : 0;
    const start = polarToCartesian(center, center, radius, startAngle);
    const end = polarToCartesian(center, center, radius, endAngle);
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
    ].join(" ");
  }, [active, animatedProgress, center, radius, startAngle]);



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
      {/* Glow */}
      {active && arcPath && (
        <motion.path
          d={arcPath}
          stroke={glowColor}
          initial={{ strokeWidth: 0 }}
          animate={{ strokeWidth: thickness * 2.2 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          fill="none"
          style={{ filter: `blur(6px)` }}
        />
      )}
      {/* Main arc */}
      {active && arcPath && (
        <motion.path
          d={arcPath}
          stroke={color}
          initial={{ strokeWidth: 0 }}
          animate={{ strokeWidth: thickness }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          fill="none"
          strokeLinecap="round"
        />
      )}
      {/* Head */}
      {active && arcPath && (
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
              fill={color}
              style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
            />
          )
      )}
    </svg>
  );
}; 