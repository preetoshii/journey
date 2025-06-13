import React, { useMemo, useEffect } from 'react';
import { motion, useTime, useTransform, useMotionValue, useAnimation, animate } from 'framer-motion';
import { svgPathProperties } from 'svg-path-properties';
import { stageColors } from './colors';
import { useJourneyModeStore } from '../../../store/useJourneyModeStore';
import type { JourneyModeStore } from '../../../store/useJourneyModeStore';

// New path data from Figma, broken into logical segments
const pathData = {
  // Discovery: A more complex path with more anchor points for a better wobble effect.
  // This is 4 connected curves, giving us 3 middle anchor points to animate.
  discovery: "M 99,500 C 140,500 180,500 220,500 C 260,500 300,500 341,500 C 382,500 422,500 462,500 C 503,500 544,500 584.602,500",
  // Action: The steep climb
  action: "C604.228,500 614.907,488.212 617.793,482.319 C670.706,397.709 778.554,225.576 786.635,213.921",
  // Integration: The final flat section
  integration: "C794.909,201.988 811.168,199.794 818.383,200.014 H1050"
};

interface MetaJourneyPathProps {
  progress: number;
  shouldAnimate: boolean;
}

export const MetaJourneyPath: React.FC<MetaJourneyPathProps> = ({ progress, shouldAnimate }) => {
  const time = useTime();
  const progressMotionValue = useMotionValue(0);
  const markerRadius = useMotionValue(0);
  const controls = useAnimation();
  const setStageProgressThresholds = useJourneyModeStore((s: JourneyModeStore) => s.setStageProgressThresholds);
  const currentStage = useJourneyModeStore((s: JourneyModeStore) => s.currentStage);

  // Create a wobbling motion value for the discovery path's 'd' attribute
  const wobblingDiscoveryPath = useTransform(
    time,
    t => {
      const amplitude = 1.5;
      const period = 4000;
      const waveLength = 160;

      const freq_t = (2 * Math.PI) / period;
      const freq_x = (2 * Math.PI) / waveLength;

      const anchors_x = [99, 220, 341, 462, 584.602];
      const cps_x = [140, 180, 260, 300, 382, 422, 503, 544];
      const path_start_x = anchors_x[0];
      const path_end_x = anchors_x[4];

      const getWavePoint = (x: number) => {
        const taper_amount = 40;
        const taper = Math.min(
          (x - path_start_x) / taper_amount,
          (path_end_x - x) / taper_amount
        );
        const effective_amplitude = amplitude * Math.max(0, taper);

        const y = 500 + effective_amplitude * Math.sin(x * freq_x - freq_t * t);
        const slope = effective_amplitude * freq_x * Math.cos(x * freq_x - freq_t * t);
        return { y, slope };
      };

      const anchors = anchors_x.map(x => ({ x, ...getWavePoint(x) }));
      
      const control_points = [
        { x: cps_x[0], y: anchors[0].slope * (cps_x[0] - anchors[0].x) + anchors[0].y },
        { x: cps_x[1], y: anchors[1].slope * (cps_x[1] - anchors[1].x) + anchors[1].y },
        { x: cps_x[2], y: anchors[1].slope * (cps_x[2] - anchors[1].x) + anchors[1].y },
        { x: cps_x[3], y: anchors[2].slope * (cps_x[3] - anchors[2].x) + anchors[2].y },
        { x: cps_x[4], y: anchors[2].slope * (cps_x[4] - anchors[2].x) + anchors[2].y },
        { x: cps_x[5], y: anchors[3].slope * (cps_x[5] - anchors[3].x) + anchors[3].y },
        { x: cps_x[6], y: anchors[3].slope * (cps_x[6] - anchors[3].x) + anchors[3].y },
        { x: cps_x[7], y: anchors[4].slope * (cps_x[7] - anchors[4].x) + anchors[4].y }
      ];

      let path = `M ${anchors[0].x},${anchors[0].y}`;
      for (let i = 0; i < 4; i++) {
        path += ` C ${control_points[i*2].x},${control_points[i*2].y} ${control_points[i*2+1].x},${control_points[i*2+1].y} ${anchors[i+1].x},${anchors[i+1].y}`;
      }
      return path;
    }
  );

  const wobblingCombinedPath = useTransform(wobblingDiscoveryPath, (d) => `${d} ${pathData.action} ${pathData.integration}`);

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
      animate(markerRadius, 12, {
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

  const discoveryEndProgress = discoveryPathLength / pathLength;
  const actionEndProgress = actionPathLength / pathLength;

  useEffect(() => {
    setStageProgressThresholds(discoveryEndProgress, actionEndProgress);
  }, [setStageProgressThresholds, discoveryEndProgress, actionEndProgress]);

  const colorTransitionWidth = 0.01; // The % of the path over which to fade colors

  const markerColor = useTransform(
    progressMotionValue,
    [
      0,
      discoveryEndProgress - colorTransitionWidth,
      discoveryEndProgress + colorTransitionWidth,
      actionEndProgress - colorTransitionWidth,
      actionEndProgress + colorTransitionWidth,
      1
    ],
    [
      stageColors.discovery,
      stageColors.discovery,
      stageColors.action,
      stageColors.action,
      stageColors.integration,
      stageColors.integration,
    ]
  );

  const activeOpacity = 1.0;
  const inactiveOpacity = 0.5;

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

  // Calculate the end point of the path
  const endPoint = pathProperties.getPointAtLength(pathLength);

  // Calculate label positions (hand-tuned for best visual match)
  const discoveryLabel = pathProperties.getPointAtLength(pathLength * 0.19);
  const actionLabel = pathProperties.getPointAtLength(pathLength * 0.59);
  const integrationLabel = pathProperties.getPointAtLength(pathLength * 0.89);

  // Calculate gradient stops and standalone path segments
  const discoveryStart = discoveryProperties.getPointAtLength(0);
  const discoveryEnd = discoveryProperties.getPointAtLength(discoveryPathLength);
  const actionStart = actionProperties.getPointAtLength(discoveryPathLength); // End of discovery
  const actionEnd = actionProperties.getPointAtLength(actionPathLength); // End of action
  const integrationStart = actionEnd;
  const integrationEnd = pathProperties.getPointAtLength(pathLength); // End of integration

  const discoverySegmentPath = pathData.discovery;
  const actionSegmentPath = `M ${actionStart.x} ${actionStart.y} ${pathData.action}`;
  const integrationSegmentPath = `M ${integrationStart.x} ${integrationStart.y} ${pathData.integration}`;

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
        {/* Stronger glow and lighten effect for highlight trail */}
        <filter id="highlight-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="10" result="glow" />
          <feColorMatrix type="matrix" values="1 0 0 0 0.5  0 1 0 0 0.5  0 0 1 0 0.5  0 0 0 1 0" result="lighten" />
          <feMerge>
            <feMergeNode in="lighten" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <mask id="trailing-mask">
          <motion.path
            d={wobblingCombinedPath}
            fill="transparent"
            stroke="white"
            strokeWidth="4"
            strokeDasharray={pathLength}
            strokeDashoffset={useTransform(progressMotionValue, (p) => (1 - p) * pathLength)}
          />
        </mask>
        {/* Gradients for Each Segment */}
        <linearGradient id="discovery-gradient" x1={discoveryStart.x} y1={discoveryStart.y} x2={discoveryEnd.x} y2={discoveryEnd.y} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={stageColors.discovery} stopOpacity="0" />
          <stop offset="3%" stopColor={stageColors.discovery} stopOpacity="1" />
          <stop offset="97%" stopColor={stageColors.discovery} stopOpacity="1" />
          <stop offset="100%" stopColor={stageColors.action} stopOpacity="1" />
        </linearGradient>
        <linearGradient id="action-gradient" x1={actionStart.x} y1={actionStart.y} x2={actionEnd.x} y2={actionEnd.y} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={stageColors.action} />
          <stop offset="97%" stopColor={stageColors.action} />
          <stop offset="100%" stopColor={stageColors.integration} />
        </linearGradient>
        <linearGradient id="integration-gradient" x1={integrationStart.x} y1={integrationStart.y} x2={integrationEnd.x} y2={integrationEnd.y} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={stageColors.integration} />
          <stop offset="97%" stopColor={stageColors.integration} />
          <stop offset="100%" stopColor={stageColors.integration} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* --- Dimmed Background Path --- */}
      <g opacity="0.3">
        {/* Draw each segment individually with its own gradient */}
        <motion.path
          d={wobblingDiscoveryPath}
          stroke="url(#discovery-gradient)"
          strokeWidth="3"
          fill="none"
          strokeDasharray={discoveryPathLength}
          initial={{ strokeDashoffset: discoveryPathLength }}
          animate={controls}
        />
        <motion.path
          d={actionSegmentPath}
          stroke="url(#action-gradient)"
          strokeWidth="3"
          fill="none"
          strokeDasharray={actionPathLength - discoveryPathLength}
          initial={{ strokeDashoffset: actionPathLength - discoveryPathLength }}
          animate={controls}
        />
        <motion.path
          d={integrationSegmentPath}
          stroke="url(#integration-gradient)"
          strokeWidth="3"
          fill="none"
          strokeDasharray={pathLength - actionPathLength}
          initial={{ strokeDashoffset: pathLength - actionPathLength }}
          animate={controls}
        />
      </g>

      {/* --- Bright Foreground Paths (masked) --- */}
      <g style={{ filter: 'url(#highlight-glow)', mask: 'url(#trailing-mask)' }}>
        {/* Draw each segment individually with its own gradient */}
        <motion.path
          d={wobblingDiscoveryPath}
          stroke="url(#discovery-gradient)"
          strokeWidth="3"
          fill="none"
        />
        <path
          d={actionSegmentPath}
          stroke="url(#action-gradient)"
          strokeWidth="3"
          fill="none"
        />
        <path
          d={integrationSegmentPath}
          stroke="url(#integration-gradient)"
          strokeWidth="3"
          fill="none"
        />
      </g>

      {/* --- Progress Marker --- */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={markerRadius}
        fill={markerColor}
        style={{ filter: 'url(#glow)' }}
      />
      {/* --- Stage Labels --- */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <motion.text
          x={discoveryLabel.x - 60}
          y={discoveryLabel.y + 38}
          fill={stageColors.discovery}
          fontFamily="Sohne, sans-serif"
          fontSize="11"
          fontWeight="400"
          letterSpacing="1"
          textAnchor="start"
          animate={{ opacity: currentStage === 'discovery' ? activeOpacity : inactiveOpacity }}
          transition={{ duration: 0.3 }}
        >
          DISCOVERY STAGE
        </motion.text>
      </motion.g>
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <motion.text
          x={actionLabel.x + 45}
          y={actionLabel.y - 8}
          fill={stageColors.action}
          fontFamily="Sohne, sans-serif"
          fontSize="11"
          fontWeight="400"
          letterSpacing="1"
          textAnchor="start"
          animate={{ opacity: currentStage === 'action' ? activeOpacity : inactiveOpacity }}
          transition={{ duration: 0.3 }}
        >
          ACTION STAGE
        </motion.text>
      </motion.g>
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <motion.text
          x={integrationLabel.x + 40}
          y={integrationLabel.y + 32}
          fill={stageColors.integration}
          fontFamily="Sohne, sans-serif"
          fontSize="11"
          fontWeight="400"
          letterSpacing="1"
          textAnchor="end"
          animate={{ opacity: currentStage === 'integration' ? activeOpacity : inactiveOpacity }}
          transition={{ duration: 0.3 }}
        >
          INTEGRATION STAGE
        </motion.text>
      </motion.g>
      {/* --- North Star at End --- */}
      <g style={{ pointerEvents: 'none' }}>
        <g transform={`translate(${endPoint.x}, ${endPoint.y}) translate(8, -22)`}>
          <motion.g
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              scale: [1, 1.18, 1],
              rotate: [0, 180],
            }}
            transition={{
              opacity: { delay: 0.9, duration: 0.5 },
              scale: { duration: 2.2, ease: 'easeInOut', repeat: Infinity },
              rotate: { duration: 1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 13 },
            }}
            style={{ originX: '50%', originY: '50%' }}
          >
            <svg width="38" height="38" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="22,2 27,17 42,22 27,27 22,42 17,27 2,22 17,17" fill={stageColors.integration} />
            </svg>
          </motion.g>
        </g>
      </g>
    </svg>
  );
};

export default MetaJourneyPath; 