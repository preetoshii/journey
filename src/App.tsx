import OverviewArea from './components/OverviewArea';
import DetailArea from './components/DetailArea';
import BackgroundLayer from './components/BackgroundLayer';
import MoonLayer from './components/MoonLayer';
import React, { useRef, useEffect, useState } from 'react';
import { useJourneyModeStore } from './store/useJourneyModeStore';

function App() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [pastThreshold, setPastThreshold] = useState(false);
  const setMode = useJourneyModeStore((s) => s.setMode);
  const mode = useJourneyModeStore((s) => s.mode);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const scrollTop = scrollContainerRef.current.scrollTop;
      if (scrollTop > 0 && !pastThreshold) {
        setPastThreshold(true);
        setMode('detail');
        console.log('Started scrolling down from OverviewArea!');
      } else if (scrollTop === 0 && pastThreshold) {
        setPastThreshold(false);
        setMode('overview');
        console.log('Scrolled back to very top (OverviewArea)!');
      }
    };
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [pastThreshold, setMode]);

  return (
    <>
      <BackgroundLayer />
      <MoonLayer />
      {/* Visual indicator for current mode */}
      <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 10000, background: 'rgba(30,30,30,0.7)', color: 'white', padding: '6px 18px', borderRadius: 8, fontSize: 16, fontFamily: 'Sohne, sans-serif', letterSpacing: '0.08em', pointerEvents: 'none' }}>
        MODE: {mode.toUpperCase()}
      </div>
      <div
        ref={scrollContainerRef}
        style={{ width: '100vw', height: '100vh', overflowY: 'auto', overflowX: 'hidden', position: 'relative', zIndex: 1 }}
      >
        <OverviewArea />
        <DetailArea />
      </div>
    </>
  );
}

export default App;
