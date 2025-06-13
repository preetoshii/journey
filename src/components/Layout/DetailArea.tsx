/*
  DetailArea.tsx
  ----------------
  This component renders the detailed view section of the journey page, which appears
  when the user scrolls down. It displays in-depth information for each moon.
  It also houses the critical logic that updates the focused moon based on which
  content card is currently centered in the viewport.

  KEY FEATURES:
  - Renders the right-hand column of content visible in "detail mode".
  - Dynamically generates content sections for each moon from the store.
  - For each moon, it iterates through predefined detail screen types (e.g., Progress, Growth, Moments)
    and renders the corresponding component for each type inside a "card".
  - Uses a scroll event listener to determine which card is closest to the center of the viewport.
  - Updates `focusedMoonIndex` and `activeCardKey` in the store based on the centered card.

  HOW IT WORKS:
  - The component attaches a throttled `scroll` event listener to the main scroll container.
  - On each scroll, it calculates the vertical center of the viewport.
  - It then iterates through all rendered content cards (stored in `cardRefs`) and calculates their
    absolute top position relative to the scroll container.
  - It finds the card whose top position is closest to the viewport's center.
  - The `key` of this "closest" card is set as the `activeCardKey` in the store, causing it to be
    highlighted visually (e.g., full opacity).
  - The moon `id` is parsed from the card key, and the `focusedMoonIndex` is updated in the store,
    which causes the `MoonVisualizer` to animate the correct moon into focus.
  - This scroll-based focusing is disabled during programmatic scrolls (e.g., after a click) via the
    `isAutoScrolling` flag from the store.

  USAGE:
  - Rendered inside the main layout grid in `App.tsx`.
  - Receives a `ref` to the main scroll container to attach its listener.
  - Relies on `nodes` from the store for content and `detailScreenTypes` for the structure.

  PLACEHOLDERS/NOTES:
  - Styling is basic and likely intended for further refinement.
*/
import React, { useEffect, useRef } from 'react';
import { useJourneyModeStore } from '../../store/useJourneyModeStore';
import { detailScreenTypes } from './detailScreenTypes';
import type { ZoomNode } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface DetailAreaProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

const DetailArea: React.FC<DetailAreaProps> = ({ scrollContainerRef }) => {
  const { 
    mode, 
    setFocusedMoonIndex, 
    isDebugMode, 
    isAutoScrolling,
    activeCardKey,
    setActiveCardKey,
    setIsAutoScrolling,
    isClickToCenterEnabled,
    focusedMoonIndex,
    setMode,
  } = useJourneyModeStore();

  // Get nodes from store and filter for moons inside the component (fixes invalid hook call)
  const storeNodes = useJourneyModeStore(s => s.nodes);
  const moonNodes = storeNodes.filter((g: ZoomNode) => g.role === 'moon');

  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  // New scroll-based focus logic
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || mode !== 'detail' || isAutoScrolling) {
      return;
    }

    let throttleTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (isAutoScrolling) return;

      const viewportCenter = container.scrollTop + container.clientHeight / 2;
      const containerTopInViewport = container.getBoundingClientRect().top;
      
      let closestCardKey: string | null = null;
      let minDistance = Infinity;

      cardRefs.current.forEach((cardEl, key) => {
        if (cardEl) {
          // This is the robust way to calculate the element's top position
          // relative to the scrollable container's content.
          const cardTopInViewport = cardEl.getBoundingClientRect().top;
          const absoluteCardTop = cardTopInViewport - containerTopInViewport + container.scrollTop;

          const distance = Math.abs(viewportCenter - absoluteCardTop);

          if (distance < minDistance) {
            minDistance = distance;
            closestCardKey = key;
          }
        }
      });

      if (closestCardKey && closestCardKey !== useJourneyModeStore.getState().activeCardKey) {
        setActiveCardKey(closestCardKey);
        
        const moonId = (closestCardKey as string).split('-')[0];
        const goalIndex = moonNodes.findIndex(goal => goal.id === moonId);
        if (goalIndex !== -1 && useJourneyModeStore.getState().focusedMoonIndex !== goalIndex + 1) {
          setFocusedMoonIndex(goalIndex + 1);
        }
      }
    };

    const throttledScrollHandler = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          handleScroll();
          throttleTimeout = null;
        }, 100); // Throttle to run at most every 100ms
      }
    };

    container.addEventListener('scroll', throttledScrollHandler);
    // Initial check on mount
    handleScroll();

    return () => {
      container.removeEventListener('scroll', throttledScrollHandler);
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [mode, isAutoScrolling, isDebugMode, scrollContainerRef, setActiveCardKey, setFocusedMoonIndex, moonNodes]);

  useEffect(() => {
    if (mode === 'overview' && activeCardKey !== null) {
      setActiveCardKey(null);
    }
  }, [mode, activeCardKey, setActiveCardKey]);

  const handleCardClick = (cardKey: string) => {
    const cardElement = cardRefs.current.get(cardKey);
    if (cardElement) {
      setIsAutoScrolling(true);
      setActiveCardKey(cardKey);

      const moonId = cardKey.split('-')[0];
      const goalIndex = moonNodes.findIndex(goal => goal.id === moonId);
      if (goalIndex !== -1) {
        setFocusedMoonIndex(goalIndex + 1);
      }
      
      if (isClickToCenterEnabled) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      setTimeout(() => {
        setIsAutoScrolling(false);
      }, 700);
    }
  };

  const isContentVisible = mode === 'detail' && focusedMoonIndex > 0;

  const handleBackToOverview = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMode('overview');
    setFocusedMoonIndex(0);
  };

  return (
    <>
      <AnimatePresence>
        {mode === 'detail' && (
          <motion.button
            key="back-button-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleBackToOverview}
            style={{
              position: 'fixed',
              top: 56,
              left: 56,
              zIndex: 10001,
              padding: '16px 32px',
              borderRadius: '28px',
              background: 'rgba(24,24,24,0.92)',
              color: 'white',
              fontFamily: 'Sohne, sans-serif',
              fontWeight: 400,
              fontSize: '18px',
              border: 'none',
              outline: 'none',
              boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)',
              cursor: 'pointer',
            }}
            whileHover={{
              scale: 1.03,
              background: 'rgba(32,32,32,0.95)',
            }}
          >
            Back
          </motion.button>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isContentVisible ? 1 : 0,
          pointerEvents: isContentVisible ? 'auto' : 'none'
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{
          display: 'flex',
          flexDirection: 'row',
          color: 'white',
          fontSize: 32,
          position: 'relative',
        }}
      >
        {/* Left half (reserved for moon focus column) */}
        <div style={{ width: '50vw', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        {/* Right half (content column) */}
        <div style={{ 
          width: '50vw', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'flex-start',
          paddingTop: 40, 
          paddingLeft: '5vw'
        }}>
          <div style={{ width: 600, display: 'flex', flexDirection: 'column', gap: 64 }}>
            {moonNodes.map((goal: ZoomNode, goalIndex: number) => (
              <div 
                key={goal.id} 
                id={goal.id}
                style={{ 
                  marginBottom: '50vh'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                  {detailScreenTypes.map((screen) => {
                    const cardKey = `${goal.id}-${screen.key}`;
                    const isCardActive = activeCardKey === cardKey;
                    
                    return (
                      <motion.div
                        layout
                        key={cardKey}
                        data-card-key={cardKey}
                        ref={el => { cardRefs.current.set(cardKey, el); }}
                        onClick={() => handleCardClick(cardKey)}
                        style={{ 
                          background: 'transparent',
                          border: (screen.key === 'active-goals' || screen.key === 'completed-goals') ? 'none' : '1px solid #333333',
                          borderRadius: 24,
                          paddingTop: '52px',
                          paddingRight: '40px',
                          paddingBottom: '52px',
                          paddingLeft: '60px',
                          marginBottom: 24,
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          minHeight: 300,
                          scrollSnapAlign: 'center',
                          opacity: isCardActive ? 1 : 0.15,
                          transition: 'opacity 0.3s ease-in-out',
                          cursor: 'pointer'
                        }}
                      >
                        <div 
                          style={{ 
                            fontFamily: "'Ivar Display', serif",
                            fontSize: '36px', 
                            fontWeight: 400,  
                            color: '#FFFFFF', 
                            marginBottom: '24px'
                          }}
                        >
                          {screen.label}
                        </div>
                      <screen.component goal={goal} />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default DetailArea; 