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

import { useZoomStore } from './useZoomStore';

/**
 * ZoomControls
 * Renders zoom in and zoom out buttons, wired to the global zoom state.
 */
export const ZoomControls = () => {
  // --- Get zoom actions and state from the store ---
  const { zoomIn, zoomOut, currentLevel } = useZoomStore();

  return (
    <div
      style={{
        position: "fixed", // Fixed to bottom-right
        bottom: "2rem",
        right: "2rem",
        display: "flex",
        gap: "1rem",
        zIndex: 1000 // On top of other UI
      }}
    >
      {/* Zoom out button (disabled at min zoom) */}
      <button
        onClick={zoomOut}
        disabled={currentLevel === "level1"}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#333",
          color: "white",
          fontSize: "1.5rem",
          cursor: currentLevel === "level1" ? "not-allowed" : "pointer",
          opacity: currentLevel === "level1" ? 0.5 : 1
        }}
        aria-label="Zoom out"
      >
        −
      </button>
      {/* Zoom in button (disabled at max zoom) */}
      <button
        onClick={() => zoomIn()}
        disabled={currentLevel === "level2"}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#333",
          color: "white",
          fontSize: "1.5rem",
          cursor: currentLevel === "level2" ? "not-allowed" : "pointer",
          opacity: currentLevel === "level2" ? 0.5 : 1
        }}
        aria-label="Zoom in"
      >
        +
      </button>
    </div>
  );
}; 