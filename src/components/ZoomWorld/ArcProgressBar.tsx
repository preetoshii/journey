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
  onDebugChange?: (isDebug: boolean) => void; // Callback for debug state changes
}

// Helper: Convert polar to cartesian
function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

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
  onDebugChange,
}) => {
  const center = containerSize / 2;
  const startAngle = Math.PI / 2; // 90deg, bottom

  // Debug state for progress
  const [debug, setDebug] = React.useState(false);
  const [debugProgress, setDebugProgress] = React.useState(progress);
  React.useEffect(() => {
    if (!debug) setDebugProgress(progress);
  }, [progress, debug]);

  // Track if this is the first time becoming active
  const [isFirstActivation, setIsFirstActivation] = React.useState(true);

  React.useEffect(() => {
    if (active && isFirstActivation) {
      setIsFirstActivation(false);
    } else if (!active) {
      setIsFirstActivation(true);
    }
  }, [active]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        const newDebug = !debug;
        setDebug(newDebug);
        onDebugChange?.(newDebug);
      }
      if (debug) {
        if (e.key === 'ArrowRight') setDebugProgress((p) => Math.min(100, p + 20));
        if (e.key === 'ArrowLeft') setDebugProgress((p) => Math.max(0, p - 20));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debug, onDebugChange]);

  // Use debug progress if in debug mode
  const effectiveProgress = debug ? debugProgress : progress;

  // Animate progress with Framer Motion
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

  // Head position as a derived value (clockwise)
  const headPos = React.useMemo(() => {
    if (!active) return { x: center, y: center };
    const endAngle = startAngle + (2 * Math.PI * (animatedProgress / 100));
    return polarToCartesian(center, center, radius, endAngle);
  }, [active, animatedProgress, center, radius, startAngle]);

  console.log('[ArcProgressBar] progress:', progress, 'radius:', radius, 'containerSize:', containerSize, 'active:', active);
  console.log('[ArcProgressBar] arcPath (render):', arcPath);
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
        border: debug ? '1px solid red' : undefined,
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
              stroke="#fff"
              strokeWidth={2}
              style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
            />
          )
      )}
    </svg>
  );
}; 