import { ZoomWorld } from './components/ZoomWorld/ZoomWorld';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [showOverlay, setShowOverlay] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(() => setShowOverlay(false), 900);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'black',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
      <ZoomWorld />
    </div>
  );
}

export default App;
