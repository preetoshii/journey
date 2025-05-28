import React from 'react';
import { ZoomWorld } from './ZoomWorld/ZoomWorld';

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
    <ZoomWorld />
  </div>
);

export default MoonLayer; 