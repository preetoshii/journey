/*
  usePanning.ts
  -------------------
  This custom React hook encapsulates all logic for panning (dragging and trackpad) and magnetic snapping in the ZoomWorld interface.
  It provides a unified, maintainable, and flexible system for handling user movement and snapping to moons, regardless of input method.

  HOW TO USE:
  - Import and call usePanning in your component, passing in the nodes and currentLevel.
  - Destructure the returned values (x, y, controls, handleDragEnd, handleWheel) and use them in your motion.div and event handlers.
  - All panning and snapping logic is contained here, so you can tweak timing, physics, or snapping behavior in one place.

  WHAT IT HANDLES:
  - Dragging with mouse/touch (Framer Motion drag)
  - Panning with trackpad (wheel events)
  - Magnetic snapping to the nearest moon after movement ends
  - Smooth spring physics for all transitions
  - Resetting position on zoom level change
  - Exposes motion values and handlers for easy integration
*/

import { useMotionValue, useAnimation } from 'framer-motion';
import { useRef, useEffect } from 'react';
import type { PanInfo } from 'framer-motion';
import type { WheelEvent } from 'react';
import type { ZoomNode } from '../../types';
import { useZoomStore } from './useZoomStore';

// Props for the usePanning hook
interface UsePanningProps {
  nodes: ZoomNode[]; // Array of all nodes (sun and moons)
  currentLevel: string; // Current zoom level (e.g. 'level1', 'level2')
}

/**
 * usePanning
 * Main hook for handling all panning and snapping logic in ZoomWorld.
 * Returns motion values and event handlers for use in your component.
 */
export const usePanning = ({ nodes, currentLevel }: UsePanningProps) => {
  // --- State and refs ---
  // Access relevant state and actions from the zoom store
  const { focusedMoonId, panTarget, setPanTarget } = useZoomStore();
  // Framer Motion animation controls for imperative animations
  const controls = useAnimation();
  // Track the current pan position (x, y) in world space
  const currentPosition = useRef({ x: 0, y: 0 });
  // Timeout ref for debouncing trackpad end detection
  const trackpadTimeoutRef = useRef<number | null>(null);
  // Store the last delta from the trackpad for velocity detection
  const lastDeltaRef = useRef({ x: 0, y: 0 });
  // Framer Motion motion values for x and y (used for both drag and trackpad)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // --- Effect: Pan to focused moon when requested ---
  useEffect(() => {
    // If we're in level2 and a panTarget is set (e.g. after clicking a moon)
    if (currentLevel === "level2" && panTarget) {
      // Find the focused moon node
      const targetMoon = nodes.find(node => node.id === focusedMoonId);
      if (targetMoon) {
        // Get the moon's position for level2
        const targetPosition = targetMoon.positions.level2;
        // Animate to center the moon using spring physics
        controls.start({
          x: -targetPosition.x,
          y: -targetPosition.y,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            mass: 1,
            bounce: 0.2
          }
        });
        // After animation, clear the pan target
        setTimeout(() => setPanTarget(null), 1000);
      }
    }
  }, [currentLevel, focusedMoonId, panTarget, controls, setPanTarget, nodes]);

  // --- Effect: Reset position when returning to level 1 ---
  useEffect(() => {
    if (currentLevel === "level1") {
      // Animate back to the origin (0,0) with spring physics
      controls.start({
        x: 0,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
          mass: 1,
          bounce: 0.2
        }
      });
    }
  }, [currentLevel, controls]);

  /**
   * findClosestMoon
   * Given a position, returns the closest moon node.
   * Used for magnetic snapping after drag or trackpad pan.
   */
  const findClosestMoon = (position: { x: number; y: number }) => {
    let closestMoon: ZoomNode | null = null;
    let minDistance = Infinity;
    // Loop through all nodes and find the closest moon
    nodes.forEach(node => {
      if (node.role === "moon") {
        const moonX = node.positions.level2.x;
        const moonY = node.positions.level2.y;
        // Euclidean distance from current position to moon
        const distance = Math.sqrt(
          Math.pow(moonX + position.x, 2) + 
          Math.pow(moonY + position.y, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestMoon = node;
        }
      }
    });
    return closestMoon;
  };

  /**
   * handleDragEnd
   * Called when a drag gesture ends (mouse/touch).
   * Updates the current position and triggers magnetic snapping.
   */
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (currentLevel === "level2") {
      // Update the current position with the drag offset
      currentPosition.current = {
        x: currentPosition.current.x + info.offset.x,
        y: currentPosition.current.y + info.offset.y
      };
      // Find and snap to the closest moon
      const closestMoon = findClosestMoon(currentPosition.current);
      if (closestMoon) {
        useZoomStore.setState({ focusedMoonId: closestMoon.id });
        setPanTarget({ x: 0, y: 0 });
      }
    }
  };

  /**
   * handleWheel
   * Called on trackpad (wheel) movement.
   * Updates the current position and triggers magnetic snapping after a short delay.
   * Uses velocity-based detection for responsiveness.
   */
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (currentLevel === "level2") {
      e.preventDefault();
      // Invert deltas for natural panning direction
      const deltaX = -e.deltaX;
      const deltaY = -e.deltaY;
      // Update motion values for Framer Motion
      x.set(x.get() + deltaX);
      y.set(y.get() + deltaY);
      // Update the current position
      currentPosition.current = {
        x: currentPosition.current.x + deltaX,
        y: currentPosition.current.y + deltaY
      };
      // Velocity-based detection: if movement is slowing down, snap sooner
      const isSlowingDown = 
        Math.abs(deltaX) < Math.abs(lastDeltaRef.current.x) * 0.5 &&
        Math.abs(deltaY) < Math.abs(lastDeltaRef.current.y) * 0.5;
      // Update last delta for next event
      lastDeltaRef.current = { x: deltaX, y: deltaY };
      // Clear any existing timeout for snapping
      if (trackpadTimeoutRef.current) {
        clearTimeout(trackpadTimeoutRef.current);
      }
      // Set a new timeout to snap to the closest moon after movement stops
      trackpadTimeoutRef.current = window.setTimeout(() => {
        const closestMoon = findClosestMoon(currentPosition.current);
        if (closestMoon) {
          useZoomStore.setState({ focusedMoonId: closestMoon.id });
          setPanTarget({ x: 0, y: 0 });
        }
      }, isSlowingDown ? 50 : 100); // Shorter delay if slowing down
    }
  };

  // --- Return values for use in your component ---
  return {
    x, // Framer Motion x motion value for panning
    y, // Framer Motion y motion value for panning
    controls, // Framer Motion animation controls for imperative animations
    handleDragEnd, // Handler for drag end (mouse/touch)
    handleWheel // Handler for trackpad (wheel) events
  };
}; 