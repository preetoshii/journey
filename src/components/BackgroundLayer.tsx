import React from 'react';
import { useJourneyModeStore } from '../store/useJourneyModeStore';
import { motion } from 'framer-motion';

const BackgroundLayer: React.FC = () => {
  const mode = useJourneyModeStore((s) => s.mode);
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          background: 'black',
          backgroundImage: 'url(/assets/bg_temporary.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          background: 'black',
          pointerEvents: 'none',
        }}
        animate={{ opacity: mode === 'detail' ? 0.9 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </>
  );
};

export default BackgroundLayer; 