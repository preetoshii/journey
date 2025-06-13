import React from 'react';
import { motion } from 'framer-motion';
import MetaJourneyPath from './MetaJourney/MetaJourneyPath';

const MetaJourneyOverlay: React.FC = () => {
  const [progress, setProgress] = React.useState(0);

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
      <MetaJourneyPath progress={progress} />

      {/* --- TEST SLIDER --- */}
      <div style={{ position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px', color: 'white', fontFamily: 'sans-serif' }}>
        <label>
          Test Progress: {Math.round(progress * 100)}%
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={progress}
            onChange={(e) => setProgress(parseFloat(e.target.value))}
            style={{ width: 400, marginLeft: 16 }}
          />
        </label>
      </div>
    </motion.div>
  );
};

export default MetaJourneyOverlay; 