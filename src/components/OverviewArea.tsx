import React from 'react';
import { motion } from 'framer-motion';
import { useJourneyModeStore } from '../store/useJourneyModeStore';

const OverviewArea: React.FC = () => {
  const mode = useJourneyModeStore((s) => s.mode);
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'auto',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, calc(-100% - 190px))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
        }}
        animate={{ opacity: mode === 'detail' ? 0 : 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Animated North Star Icon */}
        <motion.div
          style={{
            width: 48, height: 48, marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          animate={{ scale: [1, 1.18, 1], rotate: [0, 180] }}
          transition={{
            scale: { duration: 2.2, ease: 'easeInOut', repeat: Infinity },
            rotate: { duration: 1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 13 }
          }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="22,2 27,17 42,22 27,27 22,42 17,27 2,22 17,17" fill="#FF4B9B" />
          </svg>
        </motion.div>
        <div style={{
          fontFamily: 'Sohne, sans-serif',
          fontWeight: 400,
          fontSize: 16,
          letterSpacing: '0.13em',
          color: '#aaa',
          textTransform: 'uppercase',
          marginBottom: 18
        }}>
          NORTH STAR
        </div>
        <div style={{
          fontFamily: 'Ivar Headline, serif',
          fontWeight: 400,
          fontSize: 32,
          color: 'white',
          textAlign: 'center',
          maxWidth: 480,
          lineHeight: 1.3
        }}>
          To become the wild kid at summer camp all those years ago.
        </div>
      </motion.div>
    </div>
  );
};

export default OverviewArea; 