import OverviewArea from './components/Layout/OverviewArea';
import DetailArea from './components/Layout/DetailArea';
import BackgroundLayer from './components/Layout/BackgroundLayer';
import MoonLayer from './components/Layout/MoonLayer';
import React, { useRef, useEffect, useState } from 'react';
import { useJourneyModeStore } from './store/useJourneyModeStore';

function App() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [pastThreshold, setPastThreshold] = useState(false);
  const { 
    mode, 
    setMode, 
    focusedMoonIndex, 
    setFocusedMoonIndex, 
    isDebugMode, 
    toggleDebugMode,
    setScrollContainer,
    isAutoScrolling
  } = useJourneyModeStore();

  // Effect to set scroll container in store and handle scroll events
  useEffect(() => {
    if (scrollContainerRef.current) {
      setScrollContainer(scrollContainerRef.current);
    }
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const scrollTop = scrollContainerRef.current.scrollTop;
      
      if (scrollTop > 0 && !pastThreshold) {
        setPastThreshold(true);
        setMode('detail'); // Always set mode to detail
        if (!isDebugMode && !isAutoScrolling) { // Only set focusedMoonIndex if not debugging and not auto-scrolling
          setFocusedMoonIndex(1);
          console.log('Scroll: Detail mode, Auto-Focus Moon 1');
        } else if (isAutoScrolling) {
          console.log('Scroll: Detail mode, Auto-scroll in progress, focus maintained');
        }
      } else if (scrollTop === 0 && pastThreshold) {
        setPastThreshold(false);
        setMode('overview'); // Always set mode to overview
        if (!isDebugMode && !isAutoScrolling) { // Only set focusedMoonIndex if not debugging and not auto-scrolling
          setFocusedMoonIndex(0);
          console.log('Scroll: Overview mode, Auto-Focus Moon 0');
        } else if (isAutoScrolling) {
          console.log('Scroll: Overview mode, Auto-scroll in progress, focus maintained (though should be at target)');
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
    // Make sure isAutoScrolling is in dependency array
  }, [pastThreshold, setMode, setFocusedMoonIndex, isDebugMode, setScrollContainer, isAutoScrolling]);

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
    // Add all dependencies from store and state used in the effect
  }, [isDebugMode, toggleDebugMode, setFocusedMoonIndex, setMode]);

  return (
    <>
      <BackgroundLayer />
      <MoonLayer />
      {/* Visual indicator for current mode */}
      <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 10000, background: 'rgba(30,30,30,0.7)', color: 'white', padding: '6px 18px', borderRadius: 8, fontSize: 16, fontFamily: 'Sohne, sans-serif', letterSpacing: '0.08em', pointerEvents: 'none' }}>
        MODE: {mode.toUpperCase()}{isDebugMode ? ' (DEBUG)' : ''}
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
