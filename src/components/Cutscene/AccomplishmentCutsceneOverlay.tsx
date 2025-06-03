import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJourneyModeStore } from '../../store/useJourneyModeStore';

const STAR_SIZE = 28;

const StarSVG: React.FC = () => (
  <svg width={STAR_SIZE} height={STAR_SIZE} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.076 0.82951C10.6762 0.0381659 11.866 0.0381661 12.4662 0.82951L16.191 5.74027C16.2736 5.84917 16.3707 5.94628 16.4796 6.02888L21.3904 9.75372C22.1817 10.354 22.1817 11.5437 21.3904 12.1439L16.4796 15.8688C16.3707 15.9514 16.2736 16.0485 16.191 16.1574L12.4662 21.0681C11.866 21.8595 10.6762 21.8595 10.076 21.0681L6.35115 16.1574C6.26854 16.0485 6.17144 15.9514 6.06254 15.8688L1.15178 12.1439C0.360432 11.5437 0.360432 10.354 1.15178 9.75372L6.06254 6.02888C6.17144 5.94628 6.26854 5.84917 6.35115 5.74027L10.076 0.82951Z" fill="#DECBA4"/>
  </svg>
);

const CutsceneStars: React.FC = () => {
  const accomplishments = useJourneyModeStore(s => s.currentAccomplishments) || [];
  const isCutsceneActive = useJourneyModeStore(s => s.isCutsceneActive);

  React.useEffect(() => {
    if (isCutsceneActive && accomplishments.length > 0) {
      console.log('🎯 Cutscene Accomplishments:', JSON.stringify(accomplishments, null, 2));
    }
  }, [isCutsceneActive, accomplishments]);

  if (!isCutsceneActive || accomplishments.length === 0) return null;

  return (
    <>
      {accomplishments.map((acc, i) => {
        const total = accomplishments.length;
        const spacing = 48; // px between stars
        const groupWidth = (total - 1) * spacing;
        const xOffset = (i * spacing) - groupWidth / 2;
        return (
          <motion.div
            key={acc.id}
            initial={{
              x: `calc(50vw + ${xOffset}px)` ,
              y: '-60px',
              opacity: 0
            }}
            animate={{
              x: `calc(50vw + ${xOffset}px)` ,
              y: '22vh',
              opacity: 1
            }}
            transition={{
              delay: 1 + i * 0.18,
              duration: 0.7,
              type: 'spring',
              bounce: 0.3
            }}
            style={{
              position: 'fixed',
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
    </>
  );
};

const AccomplishmentCutsceneOverlay: React.FC = () => {
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
          <CutsceneStars />
        </>
      )}
    </AnimatePresence>
  );
};

export default AccomplishmentCutsceneOverlay; 