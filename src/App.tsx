import OverviewArea from './components/Layout/OverviewArea';
import DetailArea from './components/Layout/DetailArea';
import BackgroundLayer from './components/Layout/BackgroundLayer';
import MoonLayer from './components/Layout/MoonLayer';
import ScrollIndicatorLottie from './components/ScrollIndicatorLottie';
import React, { useRef, useEffect } from 'react';
import { useJourneyModeStore } from './store/useJourneyModeStore';

function App() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollTopRef = useRef<number>(0); // Ref to store previous scroll top

  const {
    setMode, 
    setFocusedMoonIndex, 
    isDebugMode, 
    toggleDebugMode,
    setScrollContainer,
    isAutoScrolling,
    isScrollSnapEnabled,
    toggleScrollSnap,
    isClickToCenterEnabled,
    toggleClickToCenter
  } = useJourneyModeStore();

  useEffect(() => {
    if (scrollContainerRef.current) {
      setScrollContainer(scrollContainerRef.current);
      // Initialize prevScrollTopRef when container is available
      prevScrollTopRef.current = scrollContainerRef.current.scrollTop;
    }

    const handleScroll = () => {
      if (!scrollContainerRef.current || isAutoScrolling) return;

      const scrollTop = scrollContainerRef.current.scrollTop;
      const currentMode = useJourneyModeStore.getState().mode;
      
      const scrollDirection = scrollTop > prevScrollTopRef.current ? 'down' : (scrollTop < prevScrollTopRef.current ? 'up' : 'none');

      // Thresholds for switching remain sensitive as per user request
      const switchToDetailThreshold = 1; // Effectively scrollTop > 0
      const switchToOverviewThreshold = window.innerHeight - 1; // Effectively scrollTop < window.innerHeight

      if (scrollDirection === 'down') {
        if (currentMode === 'overview' && scrollTop >= switchToDetailThreshold) {
          setMode('detail');
          if (!isDebugMode) {
            setFocusedMoonIndex(1);
          }
          console.log(`Scroll DOWN: Switched to Detail mode (scrollTop: ${scrollTop})`);
        }
      } else if (scrollDirection === 'up') {
        if (currentMode === 'detail' && scrollTop <= switchToOverviewThreshold) {
          setMode('overview');
          if (!isDebugMode) {
            setFocusedMoonIndex(0);
          }
          console.log(`Scroll UP: Switched to Overview mode (scrollTop: ${scrollTop})`);
        }
      }
      
      prevScrollTopRef.current = scrollTop; // Update previous scroll position
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
        console.log('Debug mode toggled', !useJourneyModeStore.getState().isDebugMode);
      }

      if (useJourneyModeStore.getState().isDebugMode) {
        switch (event.key.toLowerCase()) {
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
          case 's':
            toggleScrollSnap();
            console.log('Debug: Toggled scroll snap', useJourneyModeStore.getState().isScrollSnapEnabled);
            break;
          case 'c':
            toggleClickToCenter();
            console.log('Debug: Toggled click-to-center', useJourneyModeStore.getState().isClickToCenterEnabled);
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
  }, [toggleDebugMode, setFocusedMoonIndex, setMode, toggleScrollSnap, toggleClickToCenter]);

  return (
    <>
      <div className="App" style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <BackgroundLayer />
        <MoonLayer />
        {/* Visual indicator for current mode and debug status */}
        <div style={{ 
          position: 'fixed', 
          top: 12, 
          left: 12, 
          zIndex: 10000, 
          background: 'rgba(30,30,30,0.7)', 
          color: 'white', 
          padding: '6px 18px', 
          borderRadius: 8, 
          fontSize: 16, 
          fontFamily: 'Sohne, sans-serif', 
          letterSpacing: '0.08em', 
          pointerEvents: 'none' 
        }}>
          MODE: {useJourneyModeStore((s) => s.mode).toUpperCase()}
          {isDebugMode ? ' (DEBUG)' : ''}
          {isDebugMode ? ` | SNAP: ${isScrollSnapEnabled ? 'ON' : 'OFF'}` : ''}
          {isDebugMode ? ` | CENTER: ${isClickToCenterEnabled ? 'ON' : 'OFF'}` : ''}
        </div>
        <div
          ref={scrollContainerRef}
          id="scrollContainer"
          style={{
            width: '100vw', 
            height: '100vh', 
            overflowY: 'auto', 
            overflowX: 'hidden', 
            position: 'relative', 
            zIndex: 1,
            scrollSnapType: isScrollSnapEnabled ? 'y mandatory' : 'none'
          }}
        >
          <OverviewArea />
          <DetailArea />
        </div>
      </div>
      <ScrollIndicatorLottie />
    </>
  );
}

export default App;
