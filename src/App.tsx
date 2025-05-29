import OverviewArea from './components/Layout/OverviewArea';
import DetailArea from './components/Layout/DetailArea';
import BackgroundLayer from './components/Layout/BackgroundLayer';
import MoonLayer from './components/Layout/MoonLayer';
import React, { useRef, useEffect, useState } from 'react';
import { useJourneyModeStore } from './store/useJourneyModeStore';

function App() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const {
    setMode, 
    setFocusedMoonIndex, 
    isDebugMode, 
    toggleDebugMode,
    setScrollContainer,
    isAutoScrolling
  } = useJourneyModeStore();

  useEffect(() => {
    if (scrollContainerRef.current) {
      setScrollContainer(scrollContainerRef.current);
    }

    const handleScroll = () => {
      if (!scrollContainerRef.current || isAutoScrolling) return;

      const scrollTop = scrollContainerRef.current.scrollTop;
      const currentMode = useJourneyModeStore.getState().mode;
      const overviewAreaHeight = window.innerHeight; // Boundary for mode switch

      if (scrollTop >= overviewAreaHeight && currentMode === 'overview') {
        setMode('detail');
        if (!isDebugMode) {
          setFocusedMoonIndex(1);
          console.log('Scroll: Switched to Detail mode (boundary crossed), Auto-Focus Moon 1');
        }
      } else if (scrollTop < overviewAreaHeight && currentMode === 'detail') {
        setMode('overview');
        if (!isDebugMode) {
          setFocusedMoonIndex(0);
          console.log('Scroll: Switched to Overview mode (boundary crossed), Auto-Focus Moon 0');
        }
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
      setScrollContainer(null); 
    };
  }, [setMode, setFocusedMoonIndex, isDebugMode, isAutoScrolling, setScrollContainer]);

  // Debug mode keyboard listener effect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'd') {
        toggleDebugMode();
        console.log('Debug mode toggled', !isDebugMode);
      }

      if (isDebugMode) {
        switch (event.key) {
          case '0':
            setFocusedMoonIndex(0);
            setMode('overview');
            console.log('Debug: Focus Moon 0, Overview Mode');
            break;
          case '1':
            setFocusedMoonIndex(1);
            setMode('detail');
            console.log('Debug: Focus Moon 1, Detail Mode');
            break;
          case '2':
            setFocusedMoonIndex(2);
            setMode('detail');
            console.log('Debug: Focus Moon 2, Detail Mode');
            break;
          case '3':
            setFocusedMoonIndex(3);
            setMode('detail');
            console.log('Debug: Focus Moon 3, Detail Mode');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDebugMode, toggleDebugMode, setFocusedMoonIndex, setMode]);

  return (
    <>
      <BackgroundLayer />
      <MoonLayer />
      {/* Visual indicator for current mode */}
      <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 10000, background: 'rgba(30,30,30,0.7)', color: 'white', padding: '6px 18px', borderRadius: 8, fontSize: 16, fontFamily: 'Sohne, sans-serif', letterSpacing: '0.08em', pointerEvents: 'none' }}>
        MODE: {useJourneyModeStore((s) => s.mode).toUpperCase()}{isDebugMode ? ' (DEBUG)' : ''}
      </div>
      <div
        ref={scrollContainerRef}
        style={{
          width: '100vw', 
          height: '100vh', 
          overflowY: 'auto', 
          overflowX: 'hidden', 
          position: 'relative', 
          zIndex: 1,
          scrollSnapType: 'y mandatory'
        }}
      >
        <OverviewArea />
        <DetailArea />
      </div>
    </>
  );
}

export default App;
