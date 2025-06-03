import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJourneyModeStore } from '../../store/useJourneyModeStore';

const STAR_SIZE = 28;

// Configurable delay before triggering the progress bar boost (in ms)
const BOOST_DELAY_MS = 420;
// Configurable duration for the progress bar boost animation (in ms)
const BOOST_ANIMATION_DURATION_MS = 1100;

const StarSVG: React.FC = () => (
  <svg width={STAR_SIZE} height={STAR_SIZE} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.076 0.82951C10.6762 0.0381659 11.866 0.0381661 12.4662 0.82951L16.191 5.74027C16.2736 5.84917 16.3707 5.94628 16.4796 6.02888L21.3904 9.75372C22.1817 10.354 22.1817 11.5437 21.3904 12.1439L16.4796 15.8688C16.3707 15.9514 16.2736 16.0485 16.191 16.1574L12.4662 21.0681C11.866 21.8595 10.6762 21.8595 10.076 21.0681L6.35115 16.1574C6.26854 16.0485 6.17144 15.9514 6.06254 15.8688L1.15178 12.1439C0.360432 11.5437 0.360432 10.354 1.15178 9.75372L6.06254 6.02888C6.17144 5.94628 6.26854 5.84917 6.35115 5.74027L10.076 0.82951Z" fill="#DECBA4"/>
  </svg>
);

interface AccomplishmentCutsceneOverlayProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const CutsceneStars: React.FC<{ containerRef: React.RefObject<HTMLDivElement> }> = ({ containerRef }) => {
  const accomplishments = useJourneyModeStore(s => s.currentAccomplishments) || [];
  const isCutsceneActive = useJourneyModeStore(s => s.isCutsceneActive);
  const nodes = useJourneyModeStore(s => s.nodes);
  const triggerMoonPulse = useJourneyModeStore(s => s.triggerMoonPulse);

  // Get container size
  const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 });
  React.useLayoutEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  }, [containerRef, isCutsceneActive]);

  // Track which stars have activated their flight
  const [activatedStars, setActivatedStars] = React.useState<Set<number>>(new Set());
  // Track which stars have finished their flight (for pulse/fade)
  const [flownStars, setFlownStars] = React.useState<Set<number>>(new Set());
  // Track which stars have faded out (for AnimatePresence)
  const [fadedStars, setFadedStars] = React.useState<Set<number>>(new Set());

  // Log when all stars have finished their flight
  React.useEffect(() => {
    let boostTimeout: NodeJS.Timeout | null = null;
    let endCutsceneTimeout: NodeJS.Timeout | null = null;
    if (
      isCutsceneActive &&
      accomplishments.length > 0 &&
      flownStars.size === accomplishments.length
    ) {
      console.log('[Cutscene] All stars have finished their flight!');
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

        // When flight completes, trigger pulse and fade out
        const handleFlightComplete = () => {
          if (!flownStars.has(i)) {
            setFlownStars(prev => new Set([...prev, i]));
            if (targetMoon) triggerMoonPulse(targetMoon.id);
            // Start fade out after a short delay (so pulse is visible as star lands)
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
              // Detect when the star is at its target (flight complete)
              if (isFlying && !hasFlown && flyX !== undefined && flyY !== undefined) {
                const x = typeof latest.x === 'number' ? latest.x : 0;
                const y = typeof latest.y === 'number' ? latest.y : 0;
                // If close enough to target, consider flight complete
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

const AccomplishmentCutsceneOverlay: React.FC<AccomplishmentCutsceneOverlayProps> = ({ containerRef }) => {
  const isCutsceneActive = useJourneyModeStore((state) => state.isCutsceneActive);
  const cutsceneStep = useJourneyModeStore((state) => state.cutsceneStep);

  // For debugging, let's log when this component thinks the cutscene is active
  React.useEffect(() => {
    if (isCutsceneActive) {
      console.log('[CutsceneOverlay] Now active. Current step:', cutsceneStep);
    } else {
      console.log('[CutsceneOverlay] Now inactive.');
    }
  }, [isCutsceneActive, cutsceneStep]);

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

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.key === 'a' || e.key === 'A') && isCutsceneActive) {
        useJourneyModeStore.getState()._endCutscene();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCutsceneActive]);

  return (
    <AnimatePresence>
      {isCutsceneActive && (
        <>
          <CutsceneStars containerRef={containerRef} />
        </>
      )}
    </AnimatePresence>
  );
};

export default AccomplishmentCutsceneOverlay; 