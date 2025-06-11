/*
  DetailArea.tsx
  ----------------
  This component renders the detailed view section of the journey page, which appears
  when the user scrolls down. It displays in-depth information for each moon/goal.
  It also uses IntersectionObserver to update the focusedMoonIndex based on which
  goal's content is currently scrolled into view.

  KEY FEATURES:
  - Occupies the lower half of the scrollable page, becoming visible in "detail mode".
  - Divided into a two-column layout:
    - Left Column: Reserved for the "Moon Focus Column" (displaying the large selected moon and small dot moons).
    - Right Column: Displays detailed content for each goal.
  - Dynamically generates content sections for each moon.
  - For each moon, it iterates through predefined detail screen types (e.g., Progress, Growth, Moments)
    and renders the corresponding component for each type.
  - Updates `focusedMoonIndex` as the user scrolls through different goal sections.

  HOW IT WORKS:
  - Uses a flexbox layout to create the two columns.
  - Maps over `moonNodes` (filtered for `role === 'moon'`) to create a section for each goal.
  - Each goal section has a React ref attached.
  - An `IntersectionObserver` monitors these refs.
  - When a goal section intersects with the viewport (specifically, when its top is near the vertical center),
    the `focusedMoonIndex` in the Zustand store is updated to match that goal.
  - This auto-focusing is disabled if `isDebugMode` is active or if `mode` is not `detail`.

  USAGE:
  - Rendered as part of the main scrollable layout in `App.tsx` (or a similar top-level component).
  - Relies on `moonNodes` for goal data and `detailScreenTypes` for the structure of the detail views.

  PLACEHOLDERS/NOTES:
  - The left column is currently a simple placeholder `div` and awaits the implementation of the
    Moon Focus Column visualization.
  - Styling is basic and likely intended for further refinement.
*/
import React, { useEffect, useRef } from 'react';
import { useJourneyModeStore } from '../../store/useJourneyModeStore';
import { detailScreenTypes } from './detailScreenTypes';
import type { ZoomNode } from '../../types';
import { motion } from 'framer-motion';

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
    focusedMoonIndex
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

  return (
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
  );
};

export default DetailArea; 