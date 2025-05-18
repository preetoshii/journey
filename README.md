# ZoomWorld Developer Guide

## Overview
ZoomWorld is a modular, zoomable, and pannable React interface featuring a central Sun and multiple Moons. It supports smooth spring-based animations, magnetic snapping, and unified drag/trackpad panning. The system is designed for clarity, flexibility, and easy extension.

---

## Architecture
- **ZoomWorld.tsx**: Main UI component. Renders all nodes and zoom controls. Wires up panning/snapping via the `usePanning` hook.
- **SunMoonNode.tsx**: Renders a single node (Sun or Moon) with animation, scaling, and click logic.
- **ZoomControls.tsx**: Renders zoom in/out buttons, wired to the global zoom state.
- **usePanning.ts**: Custom hook encapsulating all panning, trackpad, and magnetic snapping logic. The single source of truth for movement mechanics.
- **useZoomStore.ts**: Zustand store for global zoom/focus/pan state and actions.
- **types.ts**: All shared types and interfaces for nodes, positions, and state.

---

## How to Use
1. **Run the app**: `npm install && npm run dev`
2. **Main entry**: `App.tsx` renders `ZoomWorld` full-screen.
3. **Zooming**: Use the +/− controls or click a moon to zoom/focus.
4. **Panning**: Drag or use the trackpad to pan. Release to magnetically snap to the nearest moon.
5. **Customization**: All movement, snapping, and animation logic is in `usePanning.ts`.

---

## Extending & Modifying
- **Change panning/snapping behavior**: Edit `usePanning.ts` (timing, velocity, spring physics, etc.).
- **Add new node types or zoom levels**: Update `types.ts` and node data in `ZoomWorld.tsx`.
- **Change zoom/focus logic**: Edit `useZoomStore.ts` for new state/actions.
- **Style nodes**: Edit `SunMoonNode.tsx` for appearance, scaling, and opacity logic.
- **Add new controls**: Extend `ZoomControls.tsx` or add new UI components.

---

## File Guide
- `src/components/ZoomWorld/ZoomWorld.tsx`: Main world UI, highly commented.
- `src/components/ZoomWorld/SunMoonNode.tsx`: Node rendering/animation, highly commented.
- `src/components/ZoomWorld/ZoomControls.tsx`: Zoom controls, highly commented.
- `src/components/ZoomWorld/usePanning.ts`: All panning/snapping logic, highly commented.
- `src/components/ZoomWorld/useZoomStore.ts`: Zustand store, highly commented.
- `src/types.ts`: All shared types, highly commented.

---

## Best Practices
- **All movement logic is unified**: Drag and trackpad use the same system for maintainability.
- **All files are thoroughly documented**: See comments for architecture and extension points.
- **To change mechanics, edit only `usePanning.ts`**: No need to touch UI code for movement changes.

---

## Getting Help
- Read the comments in each file for detailed explanations.
- For new features, start by updating types and the store, then extend the UI or panning logic as needed.
- For questions, see the comments or ask your team lead.
