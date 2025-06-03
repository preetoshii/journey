import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJourneyModeStore } from '../../store/useJourneyModeStore';

/*
  RotatingSubtitle.tsx
  --------------------
  This component displays a subtitle that cycles through an array of text strings (actions).
  Each action is shown for a period, then fades out, is replaced by the next, and the new action fades in.

  KEY FEATURES:
  - Animates a sequence of text strings with fade and slight slide transitions.
  - Cycles through the provided array of actions indefinitely.
  - Customizable timing for how long each action is displayed (`ROTATE_INTERVAL`) and fade duration (`FADE_DURATION`).
  - Supports an initial delay before the rotation starts (`delay` prop).
  - Can be globally dimmed via the `dimmed` prop.
  - Uses Framer Motion (`AnimatePresence`) for smooth animations.

  HOW IT WORKS:
  - Manages an `index` to track the current action and a `visible` state to trigger fades.
  - `useEffect` sets up timers (`setInterval`, `setTimeout`) to control the cycling and fading sequence.
  - `AnimatePresence` handles the enter and exit animations of the text elements.
  - When an action's display time is up, `visible` is set to false (fade out).
  - After the fade-out duration, the `index` is updated to the next action, and `visible` is set to true (fade in).

  USAGE:
  - Typically used to display a series of related short messages or actions under a UI element (e.g., a moon).
  - Pass an array of strings to the `actions` prop.
  - Optionally, provide `delay` for staggered starts or `dimmed` to reduce opacity.

  CONFIGURATION:
  - `ROTATE_INTERVAL`: Constant at the top of the file determining how long each subtitle is shown (ms).
  - `FADE_DURATION`: Constant at the top of the file for the fade in/out animation duration (seconds).
*/

// --- Easy-to-tweak timing variables ---
const ROTATE_INTERVAL = 13000; // ms, how long each action is shown
const FADE_DURATION = 1.0;    // seconds, fade in/out duration




export const RotatingSubtitle: React.FC<{
  actions: string[];
  delay?: number;
  dimmed?: boolean;
}> = ({ actions, delay = 0, dimmed = false }) => {
  const [index, setIndex] = React.useState(0);
  const [visible, setVisible] = React.useState(true);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isCutsceneActive = useJourneyModeStore(s => s.isCutsceneActive);

  React.useEffect(() => {
    // Start with the initial delay for staggering
    const start = setTimeout(() => {
      // Set up the interval for regular cycling
      intervalRef.current = setInterval(() => {
        setVisible(false);
        fadeTimeoutRef.current = setTimeout(() => {
          setIndex((i) => (i + 1) % actions.length);
          setVisible(true);
        }, FADE_DURATION * 1000); // Wait for fade out before switching
      }, ROTATE_INTERVAL);
      // Immediately trigger the first fade out after ROTATE_INTERVAL
      setTimeout(() => setVisible(false), ROTATE_INTERVAL - FADE_DURATION * 1000);
    }, delay);
    return () => {
      clearTimeout(start);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, [actions.length, delay]);

  // AnimatePresence handles fade out/in
  return (
    <motion.div
      style={{ minHeight: 56, marginTop: 18, padding: '0 64px', width: '80%' }}
      animate={{ opacity: isCutsceneActive ? 0 : (dimmed ? 0 : 1) }}
      transition={{ opacity: { duration: isCutsceneActive ? 0.56 : (dimmed ? 0.56 : 0.28), ease: 'easeInOut' } }}
    >
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: FADE_DURATION, ease: 'easeInOut' }}
            style={{
              fontFamily: "'Sohne', sans-serif",
              fontWeight: 400,
              fontSize: '0.88rem',
              color: '#888',
              lineHeight: 1.7,
              textAlign: 'center',
              maxWidth: 420,
              margin: '0 auto',
              pointerEvents: 'none',
              fontStyle: 'italic',
            }}
          >
            {actions[index]}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 