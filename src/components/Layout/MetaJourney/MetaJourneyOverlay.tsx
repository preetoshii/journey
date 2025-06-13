import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MetaJourneyPath from './MetaJourneyPath';
import { useJourneyModeStore } from '../../../store/useJourneyModeStore';
import { stageColors } from './colors';

const stageLabelMap = {
  discovery: 'DISCOVERY',
  action: 'ACTION',
  integration: 'INTEGRATION',
};

const stageContentMap = {
  discovery: (
    <>
      You're in the{' '}
      <span style={{ color: stageColors.discovery, fontWeight: 600, letterSpacing: 1 }}>DISCOVERY</span>
      <span> stage</span> — a time for exploration, reflection, and uncovering what truly matters to you. This is where insight starts to emerge, and new patterns begin to form.
    </>
  ),
  action: (
    <>
      You're in the{' '}
      <span style={{ color: stageColors.action, fontWeight: 600, letterSpacing: 1 }}>ACTION</span>
      <span> stage</span> — where intention turns into momentum. You're experimenting, practicing, and building habits that align with your values.
    </>
  ),
  integration: (
    <>
      You're currently in the{' '}
      <span style={{ color: stageColors.integration, fontWeight: 600, letterSpacing: 1 }}>INTEGRATION</span>
      <span> stage</span> — a phase defined by deepening the changes you've brought to your life and letting them become a daily part of your living.
    </>
  ),
};

const MetaJourneyOverlay = () => {
  const progress = useJourneyModeStore(s => s.metaJourneyProgress);
  const currentStage = useJourneyModeStore(s => s.currentStage);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const setMode = useJourneyModeStore((s) => s.setMode);

  useEffect(() => {
    const timer = setTimeout(() => setShouldAnimate(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToOverview = () => {
    setMode('overview');
  };

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
        pointerEvents: 'auto',
        overflow: 'hidden',
      }}
    >
      <motion.button
        onClick={handleBackToOverview}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        style={{
          position: 'fixed',
          top: 56,
          left: 56,
          zIndex: 3001,
          padding: '16px 32px',
          borderRadius: '28px',
          background: 'rgba(24,24,24,0.92)',
          color: 'white',
          fontFamily: 'Sohne, sans-serif',
          fontWeight: 400,
          fontSize: '18px',
          border: 'none',
          outline: 'none',
          boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)',
          cursor: 'pointer',
        }}
        whileHover={{
          scale: 1.03,
          background: 'rgba(32,32,32,0.95)',
        }}
      >
        Back
      </motion.button>
      <motion.div
        initial={{ opacity: 0, x: -50 + -420, y: -50 + -180 }}
        animate={{ opacity: 1, x: -50 + -420, y: -50 + -180 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          textAlign: 'left',
          maxWidth: 480,
          minWidth: 380,
          zIndex: 2,
        }}
      >
        <h1 style={{
          fontFamily: 'Ivar Headline, serif',
          fontSize: 38,
          fontWeight: 400,
          color: 'white',
          marginBottom: 24,
          lineHeight: 1.2,
        }}>
          Your BetterUp Journey
        </h1>
        <p style={{
          fontFamily: 'Sohne, sans-serif',
          fontSize: 17,
          lineHeight: 1.7,
          color: 'rgba(255, 255, 255, 0.85)',
          fontWeight: 400,
          marginBottom: 28,
        }}>
          BetterUp uses a multi-variable analysis to understand where you are in your broader journey of personal transformation. While these stages don't capture every moment, they reflect your general progression.
        </p>
        <p style={{
          fontFamily: 'Sohne, sans-serif',
          fontSize: 17,
          lineHeight: 1.7,
          color: 'rgba(255, 255, 255, 0.85)',
          fontWeight: 400,
        }}>
          {stageContentMap[currentStage]}
        </p>
      </motion.div>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MetaJourneyPath progress={progress} shouldAnimate={shouldAnimate} />
      </div>
    </motion.div>
  );
};

export default MetaJourneyOverlay; 