import OverviewArea from './components/Layout/OverviewArea';
import DetailArea from './components/Layout/DetailArea';
import BackgroundLayer from './components/Layout/BackgroundLayer';
import { MoonVisualizer } from './components/Moon/MoonVisualizer';
import AccomplishmentCutsceneOverlay from './components/Cutscene/AccomplishmentCutsceneOverlay';
import DebugSidebar from './components/Debug/DebugSidebar';
import React, { useRef, useEffect } from 'react';
import { useJourneyModeStore } from './store/useJourneyModeStore';

// Import accomplishment types for dummy data
import type { Accomplishment } from './types/accomplishmentTypes';

// Dummy data for testing cutscene
const dummyAccomplishmentsData: Accomplishment[] = [
  {
    id: 'accomplishment1',
    title: 'Mastered Mindfulness',
    recap: 'After weeks of practice, you can now stay present and focused for extended periods, significantly reducing daily stress.',
    goals: [
      { goalId: 'moon1', innerWorkAmount: 10 },
      { goalId: 'moon2', innerWorkAmount: 5 },
    ],
  },
  {
    id: 'accomplishment2',
    title: 'Effective Communication Breakthrough',
    recap: 'You successfully navigated a series of tough conversations, leading to better team collaboration and understanding.',
    goals: [{ goalId: 'moon3', innerWorkAmount: 8 }],
  },
  {
    id: 'accomplishment3',
    title: 'Project Phoenix Completed',
    recap: 'Successfully launched Project Phoenix ahead of schedule, showcasing strong leadership and execution.',
    goals: [{ goalId: 'moon1', innerWorkAmount: 7 }],
  },
];

/**
 * @component App
 * @description The root component of the application, serving as the main orchestrator for layout,
 * state, and global interactions.
 *
 * This component's primary responsibilities are:
 *
 * 1.  **Layout Assembly:** It establishes the fundamental page structure using a CSS grid. It renders the
 *     key layout components: `BackgroundLayer` for the visual backdrop, `OverviewArea` for the top
 *     100vh section, `DetailArea` for the scrollable content below, and the `MoonVisualizer` as a
 *     sticky overlay that animates across both sections.
 *
 * 2.  **Scroll-Driven State Management:** It contains the critical `useEffect` hook that listens to the
 *     main container's scroll events. This logic is the heart of the primary user interaction, automatically
 *     transitioning the application's global state between 'overview' and 'detail' modes based on the
 *     user's scroll position.
 *
 * 3.  **Global Event Handling & Debugging:** It sets up global keyboard listeners for developer use.
 *     This includes toggling a debug menu, forcing specific application states (like focusing on a
 *     particular moon), and triggering application-wide events like the accomplishment cutscene.
 *
 * It pulls state and setters from the `useJourneyModeStore` (Zustand) to react to and update the
 * application's global state in response to user actions.
 */
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
    toggleClickToCenter,
    triggerCutscene,
    isCutsceneActive,
    toggleDebugSidebar,
  } = useJourneyModeStore();

  /**
   * Scroll-Based Mode Switching Logic
   * ---------------------------------
   * This `useEffect` hook is the core mechanism that drives the transition between the 'overview' and 'detail'
   * modes. It attaches a scroll event listener to the main scrollable container.
   *
   * The `handleScroll` function checks the scroll position (`scrollTop`) on every scroll event.
   * - If the user scrolls down from the top, and the scroll position passes a small threshold (`switchToDetailThreshold`),
   *   it transitions the app to 'detail' mode and focuses on the first moon.
   * - If the user is in 'detail' mode and scrolls all the way back to the absolute top (`scrollTop < switchToOverviewThreshold`),
   *   it transitions the app back to 'overview' mode and unfocuses all moons.
   *
   * A `prevScrollTopRef` is used to determine the scroll direction ('up' or 'down') to ensure the logic only
   * fires once when a threshold is crossed in the correct direction. The `isAutoScrolling` flag, controlled
   * by the store, is crucial for disabling this handler during programmatic scrolls (e.g., after clicking a moon),
   * preventing race conditions and unintended mode switches.
   */
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
      const switchToOverviewThreshold = 1; // Switch back to overview only when at the very top.

      if (scrollDirection === 'down') {
        if (currentMode === 'overview' && scrollTop >= switchToDetailThreshold) {
          setMode('detail');
          if (!isDebugMode) {
            setFocusedMoonIndex(1);
          }
          console.log(`Scroll DOWN: Switched to Detail mode (scrollTop: ${scrollTop})`);
        }
      } else if (scrollDirection === 'up') {
        if (currentMode === 'detail' && scrollTop < switchToOverviewThreshold) {
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

  const currentGlobalMode = useJourneyModeStore((s) => s.mode);

  // Handler for Back button
  const handleBackToOverview = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMode('overview');
    setFocusedMoonIndex(0);
  };

  return (
    <>
      <DebugSidebar />
      <div className="App" style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <BackgroundLayer />
        <AccomplishmentCutsceneOverlay />
        {/**
         * Main Application Layout & Scroll Container
         * ------------------------------------------
         * This `div` is the primary structural element of the application. It functions as the main scroll
         * container and uses a CSS grid layout (`display: 'grid'`) to achieve the core visual effect of the
         * application.
         *
         * The grid is defined with `gridTemplateRows: '100vh auto'`.
         * - The first row (`100vh`) is the 'overview' area. It is precisely the height of the viewport,
         *   containing the initial, non-scrollable view.
         * - The second row (`auto`) contains the `DetailArea`, which holds all the content that the user
         *   scrolls through.
         *
         * The `MoonVisualizer` is placed within this grid but is styled with `position: 'sticky'` and `top: 0`,
         * which causes it to "stick" to the top of the viewport as the user scrolls down, creating the
         * effect of it visually transitioning from the overview area into the detail area. The `scrollContainerRef`
         * attached here is what enables the scroll-based mode switching logic.
         */}
        <div
          ref={scrollContainerRef}
          id="scrollContainer"
          style={{
            width: '100vw', 
            height: '100vh', 
            overflowY: isCutsceneActive ? 'hidden' : 'auto', 
            overflowX: 'hidden', 
            position: 'relative', 
            zIndex: 1,
            scrollSnapType: isScrollSnapEnabled ? 'y mandatory' : 'none',
            display: 'grid',
            gridTemplateRows: '100vh auto',
          }}
        >
          <div style={{ gridRow: '1 / 2', gridColumn: '1 / 2', position: 'relative' }}>
            <OverviewArea />
          </div>
          <MoonVisualizer />
          <div style={{ gridRow: '2 / 2', gridColumn: '1 / 2', position: 'relative' }}>
            <DetailArea scrollContainerRef={scrollContainerRef} />
          </div>
      </div>
      </div>
      {/* Back button appears only in detail mode */}
      {currentGlobalMode === 'detail' && (
        <button
          onClick={handleBackToOverview}
          style={{
            position: 'fixed',
            top: 56,
            left: 56,
            zIndex: 10001,
            background: 'rgba(30,30,30,0.85)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '10px 22px',
            fontSize: 17,
            fontFamily: 'Sohne, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'background 0.2s',
          }}
        >
          ← Back
        </button>
      )}
      {/* Floating Gear Button (Debug Sidebar Trigger) */}
      <button
        onClick={toggleDebugSidebar}
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 20000,
          width: 48,
          height: 48,
          borderRadius: 12,
          background: '#23293A',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          cursor: 'pointer',
          transition: 'background 0.2s',
          padding: 0,
        }}
        aria-label="Toggle Debug Sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cog h-5 w-5 text-white" aria-hidden="true"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 2v2"></path><path d="M12 22v-2"></path><path d="m17 20.66-1-1.73"></path><path d="M11 10.27 7 3.34"></path><path d="m20.66 17-1.73-1"></path><path d="m3.34 7 1.73 1"></path><path d="M14 12h8"></path><path d="M2 12h2"></path><path d="m20.66 7-1.73 1"></path><path d="m3.34 17 1.73-1"></path><path d="m17 3.34-1 1.73"></path><path d="m11 13.73-4 6.93"></path></svg>
      </button>
    </>
  );
}

export default App;
