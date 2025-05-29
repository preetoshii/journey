import React from 'react';
import { MoonVisualizer } from './ZoomWorld/MoonVisualizer';

const MoonLayer: React.FC = () => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 10,
      pointerEvents: 'none', // moons handle their own pointer events
      mixBlendMode: 'screen',
    }}
  >
    <MoonVisualizer />
  </div>
);

export default MoonLayer; 