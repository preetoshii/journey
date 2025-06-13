import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJourneyModeStore } from '../../store/useJourneyModeStore';

interface AccomplishmentCutsceneOverlayProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * @component AccomplishmentCutsceneOverlay
 * @description This component is the main container and orchestrator for the accomplishment cutscene.
 * It activates when `isCutsceneActive` becomes true in the store and renders the `CutsceneStars`
 * component, which handles the core animation logic.
 *
 * The cutscene follows this sequence:
 * 1.  The overlay becomes visible.
 * 2.  `CutsceneStars` renders one star for each accomplishment, initially appearing at the top of the screen.
 * 3.  After a delay, the stars begin their "flight" animation one by one, moving towards the
 *     position of their target moon.
 * 4.  As each star reaches its destination, it triggers a "pulse" animation on the moon and fades out.
 * 5.  Once all stars have completed their flight, a timeout is initiated.
 * 6.  After the timeout, `_applyPendingChanges()` is called on the store, which visually boosts the
 *     progress bars of the affected moons.
 * 7.  After the progress boost animation completes, `_endCutscene()` is called to reset the state
 *     and hide the overlay.
 *
 * It also sets up a global keydown listener to allow aborting the cutscene by pressing 'A'.
 */
const AccomplishmentCutsceneOverlay: React.FC<AccomplishmentCutsceneOverlayProps> = ({ containerRef }) => {
  const isCutsceneActive = useJourneyModeStore((state) => state.isCutsceneActive);

  // Lock body scroll when the cutscene is active to prevent user interference.
  React.useEffect(() => {
    if (isCutsceneActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCutsceneActive]);

  // Provides a debug/testing utility to abort the cutscene by pressing the 'A' key.
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.key === 'a' || e.key === 'A') && useJourneyModeStore.getState().isCutsceneActive) {
        useJourneyModeStore.getState()._endCutscene();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isCutsceneActive) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 2000,
      }}
    >
      <CutsceneStars containerRef={containerRef} />
    </div>
  );
};

// --- Helper Components & Constants ---

const STAR_SIZE = 28;
const BOOST_DELAY_MS = 420; // Delay before triggering progress boost
const BOOST_ANIMATION_DURATION_MS = 1100; // Duration of boost animation

const StarSVG: React.FC = () => (
  <svg width={STAR_SIZE} height={STAR_SIZE} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.076 0.82951C10.6762 0.0381659 11.866 0.0381661 12.4662 0.82951L16.191 5.74027C16.2736 5.84917 16.3707 5.94628 16.4796 6.02888L21.3904 9.75372C22.1817 10.354 22.1817 11.5437 21.3904 12.1439L16.4796 15.8688C16.3707 15.9514 16.2736 16.0485 16.191 16.1574L12.4662 21.0681C11.866 21.8595 10.6762 21.8595 10.076 21.0681L6.35115 16.1574C6.26854 16.0485 6.17144 15.9514 6.06254 15.8688L1.15178 12.1439C0.360432 11.5437 0.360432 10.354 1.15178 9.75372L6.06254 6.02888C6.17144 5.94628 6.26854 5.84917 6.35115 5.74027L10.076 0.82951Z" fill="#DECBA4"/>
  </svg>
);

/**
 * @component CutsceneStars
 * @description This component handles the rendering and animation of the individual stars during the
 * accomplishment cutscene. It reads the `currentAccomplishments` from the store and creates a star
 * for each one.
 *
 * It manages a complex, multi-stage animation using local state and Framer Motion:
 * - It calculates the initial position of the stars at the top of the screen.
 * - It calculates the target destination for each star based on the position of its associated moon.
 * - It uses `useEffect` with timeouts to stagger the start of each star's "flight."
 * - It uses Framer Motion's `onUpdate` callback to detect when a star has reached its destination.
 * - Upon arrival, it triggers a pulse on the target moon, fades itself out, and updates local state.
 * - Once all stars have "landed," it triggers the final store actions to apply progress and end the cutscene.
 */
const CutsceneStars: React.FC<{ containerRef?: React.RefObject<HTMLDivElement | null> }> = ({ containerRef }) => {
  const accomplishments = useJourneyModeStore(s => s.currentAccomplishments) || [];
  const isCutsceneActive = useJourneyModeStore(s => s.isCutsceneActive);
  const nodes = useJourneyModeStore(s => s.nodes);
  const triggerMoonPulse = useJourneyModeStore(s => s.triggerMoonPulse);

  const [containerSize, setContainerSize] = React.useState({ width: window.innerWidth, height: window.innerHeight });

  React.useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      } else {
        setContainerSize({ width: window.innerWidth, height: window.innerHeight });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [containerRef, isCutsceneActive]);

  const [activatedStars, setActivatedStars] = React.useState<Set<number>>(new Set());
  const [flownStars, setFlownStars] = React.useState<Set<number>>(new Set());
  const [fadedStars, setFadedStars] = React.useState<Set<number>>(new Set());

  // Once all stars have finished their flight, trigger the final state updates.
  React.useEffect(() => {
    let boostTimeout: NodeJS.Timeout | null = null;
    let endCutsceneTimeout: NodeJS.Timeout | null = null;
    if (
      isCutsceneActive &&
      accomplishments.length > 0 &&
      flownStars.size === accomplishments.length
    ) {
      // Trigger the progress bar boost after a delay
      boostTimeout = setTimeout(() => {
        useJourneyModeStore.getState()._applyPendingChanges();
        // End the cutscene after the boost animation duration
        endCutsceneTimeout = setTimeout(() => {
          useJourneyModeStore.getState()._endCutscene();
        }, BOOST_ANIMATION_DURATION_MS);
      }, BOOST_DELAY_MS);
    }
    return () => {
      if (boostTimeout) clearTimeout(boostTimeout);
      if (endCutsceneTimeout) clearTimeout(endCutsceneTimeout);
    };
  }, [flownStars, accomplishments.length, isCutsceneActive]);

  // After 1.5s, start activating stars one by one
  React.useEffect(() => {
    if (isCutsceneActive && accomplishments.length > 0) {
      const timeouts: NodeJS.Timeout[] = [];
      accomplishments.forEach((_, index) => {
        const timeout = setTimeout(() => {
          setActivatedStars(prev => new Set([...prev, index]));
        }, 1500 + (index * 200));
        timeouts.push(timeout);
      });
      return () => {
        timeouts.forEach(clearTimeout);
        setActivatedStars(new Set());
        setFlownStars(new Set());
        setFadedStars(new Set());
      };
    }
  }, [isCutsceneActive, accomplishments]);

  if (!isCutsceneActive || accomplishments.length === 0) return null;

  return (
    <AnimatePresence>
      {accomplishments.map((acc, i) => {
        if (fadedStars.has(i)) return null;
        const total = accomplishments.length;
        const spacing = 48;
        const groupWidth = (total - 1) * spacing;
        const xOffset = (i * spacing) - groupWidth / 2;
        const isFlying = activatedStars.has(i);
        const hasFlown = flownStars.has(i);
        const targetMoon = nodes.find(n => n.id === acc.goals[0].goalId);
        const targetX = targetMoon ? targetMoon.positions.level1.x : undefined;
        const targetY = targetMoon ? targetMoon.positions.level1.y : undefined;
        const flyX = isFlying ? containerSize.width / 2 + (targetX ?? 0) : undefined;
        const flyY = isFlying ? containerSize.height / 2 + (targetY ?? 0) : undefined;

        const handleFlightComplete = () => {
          if (!flownStars.has(i)) {
            setFlownStars(prev => new Set([...prev, i]));
            if (targetMoon) triggerMoonPulse(targetMoon.id);
            // Start fade out after a short delay
            setTimeout(() => setFadedStars(prev => new Set([...prev, i])), 80);
          }
        };

        return (
          <motion.div
            key={acc.id}
            initial={{
              x: `calc(50vw + ${xOffset}px)` ,
              y: '-60px',
              opacity: 0
            }}
            animate={isFlying ? {
              x: flyX,
              y: flyY,
              opacity: 1
            } : {
              x: `calc(50vw + ${xOffset}px)` ,
              y: '22vh',
              opacity: 1
            }}
            exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.32 } }}
            transition={{
              delay: 1 + i * 0.18,
              duration: isFlying ? 1.1 : 0.7,
              type: 'spring',
              bounce: 0.3
            }}
            onUpdate={(latest) => {
              if (isFlying && !hasFlown && flyX !== undefined && flyY !== undefined) {
                const x = typeof latest.x === 'number' ? latest.x : 0;
                const y = typeof latest.y === 'number' ? latest.y : 0;
                if (Math.abs(x - flyX) < 2 && Math.abs(y - flyY) < 2) {
                  handleFlightComplete();
                }
              }
            }}
            style={{
              position: 'absolute',
              zIndex: 2002,
              pointerEvents: 'none',
              width: STAR_SIZE,
              height: STAR_SIZE,
              left: 0,
              top: 0,
              transform: 'translate(-50%, 0)',
            }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: i * 0.3 }}
            >
              <StarSVG />
            </motion.div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
};

export default AccomplishmentCutsceneOverlay; 