import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJourneyModeStore } from '../../store/useJourneyModeStore';

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
        <motion.div
          key="cutscene-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute', // Changed from fixed to absolute to be relative to MoonLayer
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 0, 0, 0.3)', // Semi-transparent red for visibility
            zIndex: 20, // Higher than MoonVisualizer (assumed to be around 10-15)
            pointerEvents: 'auto', // To block interactions below for now
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
          }}
        >
          Cutscene Active - Step: {cutsceneStep}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccomplishmentCutsceneOverlay; 