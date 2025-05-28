import React from 'react';
import { ZoomWorld } from './ZoomWorld/ZoomWorld';

const OverviewArea: React.FC = () => (
  <div style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
    <ZoomWorld />
  </div>
);

export default OverviewArea; 