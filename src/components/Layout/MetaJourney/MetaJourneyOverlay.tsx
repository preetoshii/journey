import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MetaJourneyPath from './MetaJourneyPath';
import { useJourneyModeStore } from '../../../store/useJourneyModeStore';

const MetaJourneyOverlay = () => {
  const progress = useJourneyModeStore(s => s.metaJourneyProgress);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldAnimate(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'transparent',
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
      }}
    >
      <MetaJourneyPath progress={progress} shouldAnimate={shouldAnimate} />
    </motion.div>
  );
};

export default MetaJourneyOverlay; 