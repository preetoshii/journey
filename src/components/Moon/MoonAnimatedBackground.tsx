import React from 'react';
import { motion } from 'framer-motion';

interface MoonAnimatedBackgroundProps {
  color: string; // Flat background color (per-moon)
  active: boolean; // Whether the background is active (fade in/out)
  rotatingImageUrl: string; // URL for the rotating overlay image
  size?: number; // Optional: size of the background (defaults to 600)
  staggerOffset?: number; // Optional: animation delay in seconds
  hideRotatingImage?: boolean; // If true, fade out the rotating image only
  hideRotatingImageDelay?: number; // Delay (seconds) before fading out the rotating image
}

/*
  MoonAnimatedBackground.tsx
  --------------------------
  This component creates a layered, animated circular background, typically for moon elements.
  It combines a flat color base with an animated image overlay.

  KEY FEATURES:
  - Provides a two-layer background: a solid color and an animated image.
  - The entire background fades in/out based on an `active` prop.
  - The overlay image has continuous, subtle rotation and scaling animations.
  - The rotating image can be selectively faded out (e.g., for "dot" moon states).
  - Customizable via props for color, image URL, size, and animation timing.
  - Uses Framer Motion for smooth animations.

  HOW IT WORKS:
  - A `motion.div` acts as the main container, controlling overall opacity.
  - Inside, a `div` renders the flat background color.
  - A `motion.img` renders the overlay image with looping rotation and scale animations.
  - `mixBlendMode: 'screen'` is used for visual blending.

  USAGE:
  - Used by `MoonNode` to provide its dynamic background.
  - Props control appearance and active state.

  NOTE:
  - The existing comment mentioning a "grid overlay" (Layer 2) and a full 360-degree spin
    is not reflective of the current implementation. The current version has two layers
    (color and rotating image) and the image has a back-and-forth rotation with scaling.
*/


export const MoonAnimatedBackground: React.FC<MoonAnimatedBackgroundProps> = ({
  color,
  active,
  rotatingImageUrl,
  size = 600,
  staggerOffset = 0,
  hideRotatingImage = false,
  hideRotatingImageDelay = 0,
}) => {
  // Ref for the masked div
  const maskDivRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (maskDivRef.current) {
      maskDivRef.current.style.setProperty('mask-mode', 'luminance');
      maskDivRef.current.style.setProperty('-webkit-mask-mode', 'luminance');
    }
  }, [rotatingImageUrl]);

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
        zIndex: 0,
        pointerEvents: 'none',
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Masked base color layer */}
      <motion.div
        ref={maskDivRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: color,
          borderRadius: '50%',
          zIndex: 1,
          WebkitMaskImage: `url(${rotatingImageUrl})`,
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskSize: 'cover',
          maskImage: `url(${rotatingImageUrl})`,
          maskRepeat: 'no-repeat',
          maskSize: 'cover',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        animate={{ 
          rotate: [0, 30, -30, 0],
          scale: [1, 1.3, 1],
          opacity: hideRotatingImage ? 0 : 1
        }}
        transition={{
          rotate: {
            duration: 18,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: staggerOffset,
          },
          scale: {
            duration: 6.5,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: staggerOffset,
          },
          opacity: { duration: 0.3, delay: hideRotatingImageDelay }
        }}
      />
    </motion.div>
  );
}; 