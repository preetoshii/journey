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
import React, { useEffect, useRef, createRef } from 'react';
import { useJourneyModeStore } from '../../store/useJourneyModeStore';
import { detailScreenTypes } from './detailScreenTypes';
import { nodes as rawNodes } from '../Moon/MoonVisualizer'; // Renamed to avoid conflict with component name
import type { ZoomNode } from '../../types';

const moonNodes = rawNodes.filter((g: ZoomNode) => g.role === 'moon');

const DetailArea: React.FC = () => {
  const { mode, setFocusedMoonIndex, isDebugMode, isAutoScrolling } = useJourneyModeStore();
  const goalSectionRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  useEffect(() => {
    goalSectionRefs.current = Array(moonNodes.length).fill(null).map((_, i) => goalSectionRefs.current[i] || createRef<HTMLDivElement>());
  }, []);

  useEffect(() => {
    if (mode !== 'detail' || isDebugMode || isAutoScrolling) {
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0.1,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targetId = entry.target.id;
          const goalIndex = moonNodes.findIndex(goal => goal.id === targetId);
          if (goalIndex !== -1) {
            setFocusedMoonIndex(goalIndex + 1);
            console.log(`Intersection: Focused moon ${goalIndex + 1} (${targetId})`);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    goalSectionRefs.current.forEach(refObject => {
      if (refObject && refObject.current) {
        observer.observe(refObject.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [mode, isDebugMode, setFocusedMoonIndex, isAutoScrolling]);

  return (
    <div
      style={{
        height: '100vh',
        marginTop: '100vh',
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
      <div style={{ width: '50vw', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40 }}>
        <div style={{ width: 600, display: 'flex', flexDirection: 'column', gap: 64 }}>
          {moonNodes.map((goal: ZoomNode, index: number) => (
            <div 
              key={goal.id} 
              id={goal.id}
              ref={goalSectionRefs.current[index]}
              style={{ marginBottom: '20vh' }}
            >
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 18, letterSpacing: '0.03em' }}>{goal.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                {detailScreenTypes.map((screen) => (
                  <div key={screen.key} style={{ border: '1px solid #333', borderRadius: 16, background: '#181a1e', marginBottom: 24 }}>
                    <div style={{ padding: '16px 32px', fontSize: 22, fontWeight: 600, color: '#aef', borderBottom: '1px solid #222' }}>{screen.label}</div>
                    <screen.component goal={goal} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailArea; 