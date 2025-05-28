import React from 'react';

const BackgroundLayer: React.FC = () => (
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
);

export default BackgroundLayer; 