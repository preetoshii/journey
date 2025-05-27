/*
  ZoomWorld.tsx
  -------------------
  This is the main component for the zoomable, pannable world interface. It renders the sun and moons, manages zoom levels, and wires up all panning and snapping logic via the usePanning hook.

  HOW TO USE:
  - This component is the root of the zoomable world UI. It renders the nodes and zoom controls.
  - All panning, snapping, and animation logic is handled by the usePanning hook.
  - To change panning/snapping behavior, edit usePanning.ts.

  WHAT IT HANDLES:
  - Renders all nodes (sun and moons) at their correct positions
  - Handles zoom level state and passes it to usePanning
  - Wires up drag and trackpad panning via usePanning
  - Renders zoom controls
*/

import { motion } from 'framer-motion';
import { useZoomStore } from './useZoomStore';
import { SunMoonNode } from './SunMoonNode';
import { ZoomControls } from './ZoomControls';
import type { ZoomNode } from '../../types';
import { usePanning } from './usePanning';
import React, { useEffect } from 'react';

// --- Sample data for nodes (sun and moons) ---
// In a real app, this would come from props or an API
const nodes: ZoomNode[] = [
  {
    id: "moon1",
    role: "moon",
    title: "Embody inspiring leadership",
    subtitle: "You couldn't name what was scary about leading before. This month, you uncovered it — taking up space — and began carving a path forward.",
    color: "#a43e63",
    positions: {
      level1: { x: -480, y: 25 },
      level2: { x: -480, y: 25 },
      level3: { x: 0, y: 0 }
    },
    progress: 50,
    recentActions: [
      "Recently, you led a team meeting with confidence.",
      "You gave feedback to a peer despite discomfort.",
      "You volunteered to present at the all-hands.",
    ]
  },
  {
    id: "moon2",
    role: "moon",
    title: "Break free from distraction",
    subtitle: "You mentioned several moments you were distracted during family time. But this month, you carved out focused blocks, and unplugged at the park. Nice.",
    color: "#4a9063",
    positions: {
      level1: { x: 0, y: 135 },
      level2: { x: 0, y: 135 },
      level3: { x: 0, y: 0 }
    },
    progress: 75,
    recentActions: [
      "Recently, you worked on a wheel of life exercise and discovered things.",
      "You put your phone away during dinner.",
      "You finished a book without distractions.",
    ]
  },
  {
    id: "moon3",
    role: "moon",
    title: "Stand firm in my stance",
    subtitle: "Before, you often sidestepped disagreement. This month, you held your view in multiple team calls, especially in that priority tradeoff last Thursday.",
    color: "#8e4fb6",
    positions: {
      level1: { x: 480, y: 25 },
      level2: { x: 480, y: 25 },
      level3: { x: 0, y: 0 }
    },
    progress: 30,
    recentActions: [
      "Recently, you held your view in a tough meeting.",
      "You spoke up about priorities last Thursday.",
      "You disagreed constructively in a team call.",
    ]
  }
];

/**
 * ZoomWorld
 * Main component for the zoomable world UI.
 * Handles rendering, zoom state, and panning/snapping via usePanning.
 */
export const ZoomWorld = () => {
  // --- Get current zoom level from store ---
  const { currentLevel, focusedMoonId, zoomIn, zoomOut } = useZoomStore();
  // --- Get panning/snapping logic from custom hook ---
  const { x, y, controls, handleDragEnd, handleWheel } = usePanning({ nodes, currentLevel });
  const setFocus = useZoomStore((s) => s.setPanTarget);
  const [isAnyMoonInDebug, setIsAnyMoonInDebug] = React.useState(false);

  // Keyboard navigation for L2
  const lastTopMoonRef = React.useRef('moon1');
  useEffect(() => {
    if (currentLevel !== 'level2') return;
    // Track last focused top moon
    if (focusedMoonId === 'moon1' || focusedMoonId === 'moon3') {
      lastTopMoonRef.current = focusedMoonId;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      // Zoom controls (ignore if in input/textarea)
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.key === ']') zoomIn();
      if (e.key === '[') zoomOut();
      
      // Skip moon navigation if any moon is in debug mode
      if (isAnyMoonInDebug) return;
      
      let nextId = null;
      if (focusedMoonId === 'moon1') {
        if (e.key === 'ArrowRight') nextId = 'moon3';
        if (e.key === 'ArrowDown') nextId = 'moon2';
      } else if (focusedMoonId === 'moon3') {
        if (e.key === 'ArrowLeft') nextId = 'moon1';
        if (e.key === 'ArrowDown') nextId = 'moon2';
      } else if (focusedMoonId === 'moon2') {
        if (e.key === 'ArrowUp') nextId = lastTopMoonRef.current;
        if (e.key === 'ArrowLeft') nextId = 'moon1';
        if (e.key === 'ArrowRight') nextId = 'moon3';
      }
      if (nextId) {
        useZoomStore.setState({ focusedMoonId: nextId });
        setFocus({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLevel, focusedMoonId, setFocus, zoomIn, zoomOut, isAnyMoonInDebug]);

  return (
    <div 
      style={{ 
        width: "100vw", // Full viewport width
        height: "100vh", // Full viewport height
        overflow: "hidden", // Hide overflow for panning
        position: "relative", // Position context for children
        background: "black",
        backgroundImage: 'url(/assets/bg_temporary.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      onMouseDown={(e) => {
        // Set a flag to detect drag vs click
        (window as any)._zoomWorldMouseDown = { x: e.clientX, y: e.clientY };
      }}
      onMouseUp={(e) => {
        // Only handle in level2
        if (currentLevel !== 'level2') return;
        // If mouse moved more than a few pixels, treat as drag, not click
        const down = (window as any)._zoomWorldMouseDown;
        if (down && (Math.abs(e.clientX - down.x) > 5 || Math.abs(e.clientY - down.y) > 5)) return;
        // If the click target is inside a moon node, ignore
        if ((e.target as HTMLElement).closest('[data-zoom-moon]')) return;
        // Otherwise, zoom out
        zoomOut();
      }}
    >
      {/* Main panning container. Handles drag and trackpad panning. */}
      <motion.div
        drag={currentLevel !== "level1"} // Enable drag except at level1
        dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }} // Large drag bounds
        animate={controls} // Imperative animation controls (for snapping)
        onDragEnd={handleDragEnd} // Unified drag end handler
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          x, // Framer Motion x motion value
          y  // Framer Motion y motion value
        }}
        onWheel={handleWheel} // Unified trackpad handler
      >
        {/* Render all nodes (sun and moons) */}
        {nodes.map((node, idx) => (
          <SunMoonNode 
            key={node.id} 
            node={node} 
            staggerOffset={idx * 3} // 3s stagger per moon
            onDebugChange={(isDebug) => {
              if (isDebug) {
                setIsAnyMoonInDebug(true);
              } else {
                setIsAnyMoonInDebug(false);
              }
            }}
            data-zoom-moon={node.role === 'moon' ? 'true' : undefined}
          />
        ))}
      </motion.div>
      {/* Aspiration headline and North Star icon for both L1 and L2 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, calc(-100% - 220px))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10
      }}>
        {/* Diamond-shaped North Star icon (SVG) */}
        <motion.div
          style={{
            width: 48, height: 48, marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          animate={{
            scale: [1, 1.18, 1],
            rotate: [0, 180]
          }}
          transition={{
            scale: {
              duration: 2.2,
              ease: 'easeInOut',
              repeat: Infinity,
            },
            rotate: {
              duration: 1,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 13
            }
          }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="22,2 27,17 42,22 27,27 22,42 17,27 2,22 17,17" fill="#FF4B9B" />
          </svg>
        </motion.div>
        <div style={{
          fontFamily: 'Sohne, sans-serif',
          fontWeight: 400,
          fontSize: 16,
          letterSpacing: '0.13em',
          color: '#aaa',
          textTransform: 'uppercase',
          marginBottom: 18
        }}>
          NORTH STAR
        </div>
        <div style={{
          fontFamily: 'Ivar Headline, serif',
          fontWeight: 400,
          fontSize: 32,
          color: 'white',
          textAlign: 'center',
          maxWidth: 480,
          lineHeight: 1.3
        }}>
          To become the wild kid at summer camp all those years ago.
        </div>
      </div>
    </div>
  );
}; 