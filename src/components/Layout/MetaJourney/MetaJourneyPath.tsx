import React, { useMemo, useEffect } from 'react';
import { motion, useTime, useTransform, useMotionValue, useAnimation, animate } from 'framer-motion';
import { svgPathProperties } from 'svg-path-properties';

// New path data from Figma, broken into logical segments
const pathData = {
  // Discovery: Gentle curve at the beginning
  discovery: "M99,500 C252.69,500 564.976,500 584.602,500",
  // Action: The steep climb
  action: "C604.228,500 614.907,488.212 617.793,482.319 C670.706,397.709 778.554,225.576 786.635,213.921",
  // Integration: The final flat section
  integration: "C794.909,201.988 811.168,199.794 818.383,200.014 H1050"
};

interface MetaJourneyPathProps {
  progress: number;
  shouldAnimate: boolean;
}

const colors = {
  discovery: '#8A2BE2', // BlueViolet
  action: '#FFD700',    // Gold
  integration: '#00CED1' // DarkTurquoise
};

export const MetaJourneyPath: React.FC<MetaJourneyPathProps> = ({ progress, shouldAnimate }) => {
  const time = useTime();
  const progressMotionValue = useMotionValue(0);
  const markerRadius = useMotionValue(0);
  const controls = useAnimation();

  useEffect(() => {
    if (!shouldAnimate) return;
    // Animate the progress value when the prop changes
    animate(progressMotionValue, progress, {
      type: 'spring',
      damping: 20,
      stiffness: 60,
    });
    // Also animate the marker radius if progress is starting
    if (progress > 0) {
      animate(markerRadius, 16, {
        type: 'spring',
        damping: 20,
        stiffness: 60,
      });
    }
  }, [progress, progressMotionValue, markerRadius, shouldAnimate]);

  useEffect(() => {
    if (!shouldAnimate) return;
    controls.start({
      strokeDashoffset: 0,
      transition: { duration: 1.2, ease: "easeInOut" }
    });
  }, [controls, shouldAnimate]);

  // The combined path is now static as the wobble is removed
  const discoveryPathString = useMemo(() => pathData.discovery, []);
  const actionPathString = useMemo(() => pathData.discovery + " " + pathData.action, []);
  const combinedPath = useMemo(() => actionPathString + " " + pathData.integration, [actionPathString]);

  const discoveryProperties = useMemo(() => new svgPathProperties(discoveryPathString), [discoveryPathString]);
  const discoveryPathLength = discoveryProperties.getTotalLength();

  const actionProperties = useMemo(() => new svgPathProperties(actionPathString), [actionPathString]);
  const actionPathLength = actionProperties.getTotalLength();
  
  const pathProperties = useMemo(() => new svgPathProperties(combinedPath), [combinedPath]);
  const pathLength = pathProperties.getTotalLength();

  const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const cx = useMotionValue(pathProperties.getPointAtLength(0).x);
  const cy = useMotionValue(pathProperties.getPointAtLength(0).y);

  useEffect(() => {
    const unsubscribe = progressMotionValue.on("change", (latestProgress) => {
      const p = pathProperties.getPointAtLength(latestProgress * pathLength);
      cx.set(p.x);
      cy.set(p.y);
    });
    return unsubscribe;
  }, [progressMotionValue, pathProperties, pathLength, cx, cy]);

  return (
    <svg width="100%" viewBox="0 0 1200 600" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <mask id="trailing-mask">
          <motion.path
            d={combinedPath}
            fill="transparent"
            stroke="white"
            strokeWidth="4"
            strokeDasharray={pathLength}
            strokeDashoffset={useTransform(progressMotionValue, (p) => (1 - p) * pathLength)}
          />
        </mask>
      </defs>

      {/* --- Dimmed Background Path --- */}
      <g opacity="0.3">
        {/* Base layer: full path in final color */}
        <motion.path
          d={combinedPath}
          stroke={colors.integration}
          strokeWidth="3"
          fill="none"
          strokeDasharray={pathLength}
          initial={{ strokeDashoffset: pathLength }}
          animate={controls}
        />
        {/* Middle layer: discovery + action */}
        <motion.path
          d={actionPathString}
          stroke={colors.action}
          strokeWidth="3"
          fill="none"
          strokeDasharray={actionPathLength}
          initial={{ strokeDashoffset: actionPathLength }}
          animate={controls}
        />
        {/* Top layer: discovery only */}
        <motion.path
          d={discoveryPathString}
          stroke={colors.discovery}
          strokeWidth="3"
          fill="none"
          strokeDasharray={discoveryPathLength}
          initial={{ strokeDashoffset: discoveryPathLength }}
          animate={controls}
        />
      </g>

      {/* --- Bright Foreground Paths (masked) --- */}
      <g style={{ filter: 'url(#glow)', mask: 'url(#trailing-mask)' }}>
        {/* Base layer: full path in final color */}
        <path
          d={combinedPath}
          stroke={colors.integration}
          strokeWidth="3"
          fill="none"
        />
        {/* Middle layer: discovery + action */}
        <path
          d={actionPathString}
          stroke={colors.action}
          strokeWidth="3"
          fill="none"
        />
        {/* Top layer: discovery only */}
        <path
          d={discoveryPathString}
          stroke={colors.discovery}
          strokeWidth="3"
          fill="none"
        />
      </g>

      {/* --- Progress Marker --- */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={markerRadius}
        fill="white"
        style={{ filter: 'url(#glow)' }}
      />
    </svg>
  );
};

export default MetaJourneyPath; 