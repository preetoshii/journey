/*
  OverviewArea.tsx
  ------------------
  This component renders the top section of the scrollable journey page, visible on initial load.
  It primarily displays the "North Star" aspiration and its associated text.
  The moons, while visually part of this overview, are rendered by the `MoonLayer`.

  KEY FEATURES:
  - Occupies the full viewport height and width, serving as the initial view.
  - Displays the North Star icon (an animated SVG) and its descriptive text.
  - The North Star content (icon and text) fades out when the page scrolls into "detail mode"
    and fades back in when returning to "overview mode".
  - The North Star icon has continuous subtle scale and rotation animations.

  HOW IT WORKS:
  - The main container div is set to full viewport size.
  - A `motion.div` groups the North Star icon and text elements.
    This group is absolutely positioned towards the top-center of the screen.
  - The opacity of this group is animated based on the `mode` from `useJourneyModeStore`
    (fades out in 'detail' mode).
  - The North Star SVG icon uses Framer Motion for continuous scale (pulse) and intermittent
    rotation animations.

  USAGE:
  - Rendered as the first main section in the scrollable page layout (e.g., in `App.tsx`).
  - Works in conjunction with `DetailArea` (which appears below it) and `MoonLayer`
    (which renders moons on top of it).

  RELATIONSHIP TO OTHER COMPONENTS:
  - `MoonLayer`: Renders moons that visually appear as part of this overview but are in a
    separate, higher layer.
  - `DetailArea`: The section that appears when scrolling past the `OverviewArea`.
  - `useJourneyModeStore`: Provides the `mode` state that triggers the fade animation.
*/


import React from 'react';
import { motion } from 'framer-motion';
import { useJourneyModeStore } from '../../store/useJourneyModeStore';

const OverviewArea: React.FC = () => {
  const mode = useJourneyModeStore((s) => s.mode);
  const isCutsceneActive = useJourneyModeStore((s) => s.isCutsceneActive);
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'auto',
        scrollSnapAlign: 'start'
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, calc(-100% - 190px))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
        }}
        animate={{ opacity: isCutsceneActive ? 0 : (mode === 'detail' ? 0 : 1) }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Animated North Star Icon */}
        <motion.div
          style={{
            width: 48, height: 48, marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          animate={{ scale: [1, 1.18, 1], rotate: [0, 180] }}
          transition={{
            scale: { duration: 2.2, ease: 'easeInOut', repeat: Infinity },
            rotate: { duration: 1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 13 }
          }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="22,2 27,17 42,22 27,27 22,42 17,27 2,22 17,17" fill="#FF4B9B" />
          </svg>
        </motion.div>
        <div style={{
          fontFamily: 'Sohne, sans-serif',
          fontWeight: 400,
          fontSize: 16,
          letterSpacing: '0.13em',
          color: '#aaa',
          textTransform: 'uppercase',
          marginBottom: 18
        }}>
          NORTH STAR
        </div>
        <div style={{
          fontFamily: 'Ivar Headline, serif',
          fontWeight: 400,
          fontSize: 32,
          color: 'white',
          textAlign: 'center',
          maxWidth: 480,
          lineHeight: 1.3
        }}>
          To become the wild kid at summer camp all those years ago.
        </div>
      </motion.div>
    </div>
  );
};

export default OverviewArea; 