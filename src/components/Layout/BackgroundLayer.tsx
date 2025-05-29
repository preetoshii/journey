import React from 'react';
import { useJourneyModeStore } from '../../store/useJourneyModeStore';
import { motion } from 'framer-motion';

/**
 * BackgroundLayer Component
 * ---------------------------
 * This component is responsible for rendering the application's visual background.
 * 
 * **IMPORTANT NOTE:** The current implementation, especially the use of `/assets/bg_temporary.png`
 * and the specific overlay logic, is considered temporary. This entire component or its
 * internal mechanisms are expected to be replaced or managed by a more global background/theme 
 * system upon integration with the larger main application.
 *
 * It consists of two main parts:
 *
 * 1. Static Background Image:
 *    - A `div` element is used to display a fixed background image (`/assets/bg_temporary.png`).
 *    - This image covers the entire viewport and is positioned at the lowest stack level (zIndex: 0).
 *    - It serves as the base visual layer for the entire application.
 *    - `pointerEvents: 'none'` is set to ensure it doesn't interfere with user interactions on overlying elements.
 *    - **NOTE:** The specific background image (`bg_temporary.png`) is a placeholder and is expected to be
 *      replaced or managed by the larger application upon integration.
 *
 * 2. Dynamic Overlay for Detail Mode:
 *    - A `motion.div` (from Framer Motion) is layered on top of the static background image (zIndex: 1).
 *    - This overlay is a solid black color.
 *    - Its opacity is animated based on the application's current mode (obtained from `useJourneyModeStore`):
 *      - In 'detail' mode, the overlay fades in to an opacity of 0.9, creating a darkening effect over the background.
 *      - In 'overview' mode, the overlay fades out to an opacity of 0, making it fully transparent.
 *    - This provides a smooth visual transition when switching between modes and helps to differentiate them,
 *      potentially bringing more focus to the content in 'detail' mode.
 *    - `pointerEvents: 'none'` is also set here.
 *    - **NOTE:** This entire overlay mechanism might be superseded by a more global background/theme management
 *      system in the main application upon integration.
 */
const BackgroundLayer: React.FC = () => {
  // Get the current mode ('overview' or 'detail') from the Zustand store
  const mode = useJourneyModeStore((s) => s.mode);
  return (
    <>
      {/* Static Background Image Layer */}
      {/* This div displays the primary background image for the application. */}
      {/* It is fixed, covers the full viewport, and sits at the bottom of the z-index stack. */}
      {/* NOTE: The image asset (`bg_temporary.png`) is a temporary placeholder. */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0, // Ensures this is the bottom-most layer
          background: 'black', // Fallback background color
          backgroundImage: 'url(/assets/bg_temporary.png)', // Main background image (temporary)
          backgroundSize: 'cover', // Ensures the image covers the entire area
          backgroundPosition: 'center', // Centers the image
          backgroundRepeat: 'no-repeat', // Prevents the image from repeating
          pointerEvents: 'none', // Allows clicks to pass through to elements above
        }}
      />
      {/* Dynamic Darkening Overlay for Detail Mode */}
      {/* This motion.div creates a black overlay that animates its opacity based on the current mode. */}
      {/* In 'detail' mode, it darkens the background. In 'overview' mode, it's transparent. */}
      {/* NOTE: This overlay logic may be handled differently in the integrated application. */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1, // Positioned above the static background image, below main content
          background: 'black', // Color of the overlay
          pointerEvents: 'none', // Allows clicks to pass through
        }}
        // Animate opacity based on the current mode
        animate={{ opacity: mode === 'detail' ? 0.9 : 0 }} // 90% opaque in detail, transparent in overview
        transition={{ duration: 0.5, ease: 'easeInOut' }} // Smooth 0.5s transition
      />
    </>
  );
};

export default BackgroundLayer; 