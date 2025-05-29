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
      }}
    >
      Detail Area (placeholder)
    </div>
  );
};

export default DetailArea; 