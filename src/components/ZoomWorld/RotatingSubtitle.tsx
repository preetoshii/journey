import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Easy-to-tweak timing variables ---
const ROTATE_INTERVAL = 13000; // ms, how long each action is shown
const FADE_DURATION = 1.0;    // seconds, fade in/out duration

/**
 * RotatingSubtitle
 * ----------------
 * Displays a subtitle that cycles through an array of actions (strings),
 * fading out, changing text, and fading in. Designed to be flexible for
 * future data sources (e.g., array of objects, render prop, etc).
 *
 * Props:
 *   - actions: string[] (array of recent action texts)
 *   - delay?: number (ms, initial delay before the first switch)
 *   - dimmed?: boolean (whether the subtitle is dimmed)
 *
 * Usage:
 *   <RotatingSubtitle actions={['Action 1', 'Action 2']} delay={500} />
 *
 * To change timing, edit ROTATE_INTERVAL and FADE_DURATION above.
 */
export const RotatingSubtitle: React.FC<{
  actions: string[];
  delay?: number;
  dimmed?: boolean;
}> = ({ actions, delay = 0, dimmed = false }) => {
  const [index, setIndex] = React.useState(0);
  const [visible, setVisible] = React.useState(true);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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
      animate={{ opacity: dimmed ? 0 : 1 }}
      transition={{ opacity: { duration: dimmed ? 0.56 : 0.28, ease: 'easeInOut' } }}
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