import { ZoomWorld } from './components/ZoomWorld/ZoomWorld';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <ZoomWorld />
    </div>
  );
}

export default App;
