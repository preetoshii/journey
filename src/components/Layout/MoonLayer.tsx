/*
  MoonLayer.tsx
  ---------------
  This component serves as a fixed overlay layer dedicated to rendering the moons
  via the `MoonVisualizer`. It ensures that the moons remain visible and positioned
  correctly on top of all other page content, regardless of scrolling.

  KEY FEATURES:
  - Fixed positioning: Covers the entire viewport and does not scroll with the page.
  - High `zIndex`: Ensures it renders above other content layers.
  - `pointerEvents: 'none'`: Allows click/touch events to pass through the layer itself,
    deferring to interactive elements within `MoonVisualizer` (i.e., individual moons)
    to handle their own events.
  - `mixBlendMode: 'screen'`: Blends the moons visually with the content underneath, often
    creating a brighter, glowing effect.

  HOW IT WORKS:
  - A `div` is styled with `position: 'fixed'` and dimensions to cover the viewport.
  - It renders the `MoonVisualizer` component as its sole child.
  - The combination of fixed positioning and `zIndex` keeps the moons visually on top.

  USAGE:
  - Typically rendered at a high level in the component tree, often directly within `App.tsx`,
    to ensure it overlays all other scrollable and static content.

  RELATIONSHIP TO OTHER COMPONENTS:
  - `MoonVisualizer`: The `MoonLayer` directly contains and displays the `MoonVisualizer`,
    which is responsible for the actual layout and rendering of moon elements.
  - `BackgroundLayer`, `OverviewArea`, `DetailArea`: The `MoonLayer` sits on top of these
    components due to its `zIndex`.
*/


import React from 'react';
import { MoonVisualizer } from '../Moon/MoonVisualizer';
import AccomplishmentCutsceneOverlay from '../Cutscene/AccomplishmentCutsceneOverlay';

const MoonLayer: React.FC = () => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 10,
      pointerEvents: 'none', // moons handle their own pointer events
      // mixBlendMode: 'screen', // This was on MoonLayer, AccomplishmentCutsceneOverlay might need its own or this might affect it
    }}
  >
    <MoonVisualizer />
    <AccomplishmentCutsceneOverlay />
  </div>
);

export default MoonLayer; 