/*
  ZoomControls.tsx
  -------------------
  This component renders the zoom in and zoom out controls for the ZoomWorld interface.
  It interacts with the global zoom state and disables buttons as appropriate.

  HOW TO USE:
  - Used by ZoomWorld to render zoom controls in the bottom-right corner.
  - Handles zoom in/out actions and disables buttons at min/max zoom levels.

  WHAT IT HANDLES:
  - Zoom in and zoom out actions
  - Disabling controls at min/max zoom levels
  - Simple, accessible UI for zooming
*/

import React from 'react';
import { useZoomStore } from './useZoomStore';
import { motion } from 'framer-motion';
import { playSound } from './soundUtils';

const sliderLevels = ["level1", "level2", "level3"];

/**
 * ZoomControls
 * Renders zoom in and zoom out buttons, wired to the global zoom state.
 */
export const ZoomControls = () => {
  // --- Get zoom actions and state from the store ---
  const { zoomIn, zoomOut, currentLevel } = useZoomStore();
  const currentIndex = sliderLevels.indexOf(currentLevel);
  const [zoomInAnim, setZoomInAnim] = React.useState(false);
  const [zoomOutAnim, setZoomOutAnim] = React.useState(false);

  return (
    <div style={{
      position: "fixed",
      bottom: "2rem",
      right: "2rem",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      zIndex: 1000
    }}>
      {/* Pill-shaped zoom control */}
      <div
        style={{
          background: "#232427",
          borderRadius: "2rem",
          width: 64,
          height: 135,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          padding: 0,
          position: "relative"
        }}
      >
        {/* Zoom in button */}
        <motion.button
          onClick={() => {
            playSound('button-click.wav');
            setZoomInAnim(true);
            zoomIn();
          }}
          disabled={currentLevel === "level2"}
          style={{
            background: "none",
            border: "none",
            outline: "none",
            width: 64,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: currentLevel === "level2" ? "not-allowed" : "pointer",
            opacity: currentLevel === "level2" ? 0.2 : 1,
            transition: "opacity 0.2s"
          }}
          aria-label="Zoom in"
          animate={zoomInAnim ? { scale: 1.3 } : { scale: 1 }}
          transition={zoomInAnim ? { duration: 0.2, ease: "easeIn" } : { duration: 0.2, ease: "easeOut" }}
          onAnimationComplete={() => {
            if (zoomInAnim) setTimeout(() => setZoomInAnim(false), 0);
          }}
          whileHover={{ scale: 1.13 }}
        >
          {/* Magnifying glass with plus */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="15" cy="15" r="10" />
            <line x1="15" y1="11" x2="15" y2="19" />
            <line x1="11" y1="15" x2="19" y2="15" />
            <line x1="22" y1="22" x2="28" y2="28" />
          </svg>
        </motion.button>
        {/* Divider */}
        <div style={{ width: "80%", height: 1, background: "#393a3d" }} />
        {/* Zoom out button */}
        <motion.button
          onClick={() => {
            playSound('button-click.wav');
            setZoomOutAnim(true);
            zoomOut();
          }}
          disabled={currentLevel === "level1"}
          style={{
            background: "none",
            border: "none",
            outline: "none",
            width: 64,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: currentLevel === "level1" ? "not-allowed" : "pointer",
            opacity: currentLevel === "level1" ? 0.2 : 1,
            transition: "opacity 0.2s"
          }}
          aria-label="Zoom out"
          animate={zoomOutAnim ? { scale: 1.3 } : { scale: 1 }}
          transition={zoomOutAnim ? { duration: 0.2, ease: "easeIn" } : { duration: 0.2, ease: "easeOut" }}
          onAnimationComplete={() => {
            if (zoomOutAnim) setTimeout(() => setZoomOutAnim(false), 0);
          }}
          whileHover={{ scale: 1.13 }}
        >
          {/* Magnifying glass with minus */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="15" cy="15" r="10" />
            <line x1="11" y1="15" x2="19" y2="15" />
            <line x1="22" y1="22" x2="28" y2="28" />
          </svg>
        </motion.button>
      </div>
      {/* Vertical slider indicator */}
      <div style={{
        height: 115,
        marginLeft: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative"
      }}>
        {/* Vertical line */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: 0,
          width: 4,
          height: "100%",
          background: "#393a3d",
          borderRadius: 2,
          transform: "translateX(-50%)"
        }} />
        {/* Slider nodes */}
        {sliderLevels.map((level, idx) => (
          <div
            key={level}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: idx === currentIndex ? "#fff" : "#5a5a5a",
              border: "none",
              zIndex: 1,
              margin: 0
            }}
          />
        ))}
      </div>
    </div>
  );
}; 