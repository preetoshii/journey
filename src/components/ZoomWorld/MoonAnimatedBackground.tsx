import React from 'react';
import { motion } from 'framer-motion';

interface MoonAnimatedBackgroundProps {
  color: string; // Flat background color (per-moon)
  active: boolean; // Whether the background is active (fade in/out)
  gridImageUrl: string; // URL for the grid overlay image
  rotatingImageUrl: string; // URL for the rotating overlay image
  size?: number; // Optional: size of the background (defaults to 600)
}

/**
 * MoonAnimatedBackground
 * Modular, extensible animated background for moons.
 * - 3 layers: flat color, grid overlay, rotating overlay
 * - Fades in/out based on 'active' prop
 * - Rotating overlay spins 360deg every 15s
 * - All assets are passed as props for easy swapping
 * - Future: swap internals for ThreeJS/canvas, keep API the same
 */
export const MoonAnimatedBackground: React.FC<MoonAnimatedBackgroundProps> = ({
  color,
  active,
  gridImageUrl,
  rotatingImageUrl,
  size = 600,
}) => {
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: active ? 1 : 0,
        transition: active
          ? { duration: 3 }
          : { delay: 0, duration: 0.5 },
      }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        zIndex: 0, // Ensure it's behind the moon circle
        pointerEvents: 'none',
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Layer 1: Flat color */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: color,
          borderRadius: '50%',
          zIndex: 1,
        }}
      />
      {/* Layer 2: Grid overlay */}
      <img
        src={gridImageUrl}
        alt="Grid overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%',
          zIndex: 2,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        draggable={false}
      />
      {/* Layer 3: Rotating overlay */}
      <motion.img
        src={rotatingImageUrl}
        alt="Rotating overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%',
          zIndex: 3,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        draggable={false}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 30,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}; 