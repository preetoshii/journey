/*
  OverviewArea.tsx
  ------------------
  This component renders the top section of the scrollable journey page, visible on initial load.
  It primarily displays the "North Star" aspiration and its associated text.
  The moons, while visually part of this overview, are rendered by the `MoonVisualizer`.

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
  - Works in conjunction with `DetailArea` (which appears below it) and `MoonVisualizer`
    (which renders moons on top of it).

  RELATIONSHIP TO OTHER COMPONENTS:
  - `MoonVisualizer`: Renders moons that visually appear as part of this overview but are in a
    separate, sticky layer.
  - `DetailArea`: The section that appears when scrolling past the `OverviewArea`.
  - `useJourneyModeStore`: Provides the `mode` state that triggers the fade animation.
*/


import React from 'react';
import { motion } from 'framer-motion';
import { useJourneyModeStore } from '../../store/useJourneyModeStore';

// Placeholder for meta journey state
const metaJourneyState = 'discovery'; // Change to 'action' or 'integration' to test
const metaJourneyTextMap = {
  discovery: 'Discovery Stage',
  action: 'Action Stage',
  integration: 'Integration Stage',
};

const OverviewArea: React.FC = () => {
  const mode = useJourneyModeStore((s) => s.mode);
  const isCutsceneActive = useJourneyModeStore((s) => s.isCutsceneActive);
  const setMode = useJourneyModeStore((s) => s.setMode);
  const currentStage = useJourneyModeStore(s => s.currentStage);

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
          transform: 'translate(-50%, calc(-100% - 140px))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
        }}
        animate={{ opacity: isCutsceneActive ? 0 : 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Animated North Star Icon */}
        <motion.div
          style={{
            width: 48, height: 48, marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          animate={{ 
            scale: [1, 1.18, 1], 
            rotate: [0, 180],
            opacity: mode !== 'overview' ? 0 : 1, // Fades out in detail and meta
          }}
          transition={{
            scale: { duration: 2.2, ease: 'easeInOut', repeat: Infinity },
            rotate: { duration: 1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 13 },
            opacity: { type: 'spring', damping: 20, stiffness: 100 },
          }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="22,2 27,17 42,22 27,27 22,42 17,27 2,22 17,17" fill="#FF4B9B" />
          </svg>
        </motion.div>
        {/* Fade group: label, text, and button */}
        <motion.div
          animate={{ opacity: (mode === 'detail' || mode === 'meta') ? 0 : 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
        >
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
          {/* Meta Journey Button */}
          <motion.button
            style={{
              marginTop: 32,
              padding: '0.9em 2.8em 1.2em 2em',
              borderRadius: 28,
              background: 'rgba(24,24,24,0.92)',
              color: 'white',
              fontFamily: 'Sohne, sans-serif',
              fontWeight: 400,
              fontSize: 18,
              border: 'none',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)',
              cursor: 'pointer',
            }}
            whileHover={{
              scale: 1.03,
              background: 'rgba(32,32,32,0.95)',
              transition: { duration: 0.2 }
            }}
            onClick={() => setMode('meta')}
          >
            {/* Simple placeholder icon (bar chart) */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="13" width="3" height="6" rx="1.5" fill="#fff" fillOpacity="0.7" />
              <rect x="9" y="8" width="3" height="11" rx="1.5" fill="#fff" fillOpacity="0.85" />
              <rect x="15" y="3" width="3" height="16" rx="1.5" fill="#fff" />
            </svg>
            {metaJourneyTextMap[currentStage]}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OverviewArea; 