import React from 'react';
import { useJourneyModeStore } from '../store/useJourneyModeStore';

const DetailArea: React.FC = () => {
  const mode = useJourneyModeStore((s) => s.mode);
  return (
    <div
      style={{
        height: '200vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 32,
        boxShadow: mode === 'detail' ? '0 0 32px 8px #4a906355' : undefined,
        borderTop: mode === 'detail' ? '2px solid #4a906355' : '2px solid #222',
        transition: 'box-shadow 0.4s, border 0.4s',
      }}
    >
      Detail Area (placeholder)
    </div>
  );
};

export default DetailArea; 