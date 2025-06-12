# JOURNEY PAGE: DEFINITIVE TECHNICAL DEVELOPER GUIDE

---

## SECTION 1: INTRODUCTION AND CORE CONCEPTS

This document provides an in-depth technical breakdown of the Journey Page application. The primary goal is to equip a developer with the necessary knowledge to understand, maintain, and integrate this module into a larger host application.

The Journey Page is not just a set of components; it is a self-contained, state-driven system. The core concepts are:

### 🧠 A Centralized State Machine
A single Zustand store acts as the "brain" of the application. All UI states, data, and user interactions are managed through this store. This makes the application's behavior predictable and easier to debug.

### 🖱️ Scroll-Driven Interface
The primary mode of navigation is the user's scroll position. The application listens to scroll events and translates them into state changes, creating a seamless and interactive journey through the content.

### 🌓 Two-Mode View System
The application operates in two primary modes: `'overview'` and `'detail'`.

- `'overview'`: All "moons" (nodes) are visible in a condensed layout, providing a high-level summary.
- `'detail'`: A single moon is brought into focus, and its detailed content is displayed alongside it. The transition between these modes is fully animated.

### 🔗 Decoupled Data and View
The components are designed to be agnostic about the data they display. The data (the nodes array) is fed into the state store, and the components render based on the current state. This allows for easy integration with any backend or data source.

---

## SECTION 2: CORE DATA STRUCTURES (THE DATA CONTRACT)

To integrate the Journey Page, the host application must provide data that conforms to the following TypeScript interfaces:

```ts
// Represents a single "moon" or primary topic
interface ZoomNode {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  goals: Goal[];
  icon: string;
  lottieAnimation: any;
  isCore: boolean;
}

// Represents a goal/task within a ZoomNode
interface Goal {
  id: string;
  title: string;
  isCompleted: boolean;
}

// Represents a completed goal that triggers a cutscene
interface Accomplishment {
  nodeId: string;
  goal: Goal;
}
```

---

## SECTION 3: ARCHITECTURE DEEP DIVE

### 3.1. STATE MANAGEMENT (`useJourneyModeStore.ts`)

Understanding the state store is the single most critical part of understanding this application. It is the **single source of truth**.

#### 🧾 Properties

- `mode: 'overview' | 'detail'`
- `focusedMoonIndex: number`
- `nodes: ZoomNode[]`
- `scrollContainer: HTMLDivElement | null`
- `isAutoScrolling: boolean`
- `isDebugMode: boolean`
- `isCutsceneActive: boolean`
- `cutsceneStep: CutsceneStep`
- `currentAccomplishments: Accomplishment[] | null`
- `pendingGoalUpdates: Record<string, any>`
- `pulseMoons: Record<string, boolean>`

#### 🛠️ Actions (Public API)

- `setMode`
- `setFocusedMoonIndex`
- `setNodes`
- `setScrollContainer`
- `triggerCutscene(accomplishments)`

---

### 3.2. THE CUTSCENE SUBSYSTEM

The cutscene is a multi-step process orchestrated by the state store to provide rich, animated feedback.

#### 🔁 Flow

1. **Initiation**  
   `triggerCutscene(accomplishments)` is called.

2. **Preparation** (`_prepareCutsceneState`)  
   - `isCutsceneActive = true`
   - Calculates the future state and stores it in `pendingGoalUpdates`
   - The main `nodes` state is **not yet updated**

3. **Rendering** (`AccomplishmentCutsceneOverlay.tsx`)  
   - Listens to `isCutsceneActive`
   - Renders and animates the cutscene overlay based on `cutsceneStep`

4. **State Application** (`_applyPendingChanges`)  
   - Merges `pendingGoalUpdates` into `nodes`

5. **Conclusion** (`_endCutscene`)  
   - Resets cutscene-related state and unlocks the UI

---

### 3.3. LAYOUT & ANIMATION ENGINE (`MoonVisualizer.tsx`)

Responsible for layout calculations and animation behavior:

- Reads `mode` and `focusedMoonIndex` from store
- Calculates `(x, y)` and `scale` for each moon
- Passes these values as props to each `MoonNode`
- Uses Framer Motion's `layoutId` to automatically animate between layouts

---

### 3.4. SCROLL-TO-FOCUS MECHANISM (`DetailArea.tsx`)

Uses `IntersectionObserver` to track scroll focus:

- Only visible in `'detail'` mode
- Renders all moons’ long-form content in a vertical column
- Each moon has a trigger element watched by the observer
- The most visible trigger sets `focusedMoonIndex` via store

> This is key to linking scroll position with moon focus, and understanding it is essential for debugging.

---

### 3.5. COMPONENT RESPONSIBILITIES

- **`OverviewArea.tsx`** – Visible only in `'overview'` mode. Can contain titles, summaries, or calls to action.
- **`DetailArea.tsx`** – Renders content in `'detail'` mode and informs the state store of scroll focus.

---

## SECTION 4: INTEGRATION GUIDE

### 4.1. BUILD ENVIRONMENT (VITE)

- Uses `Vite` as the build system.
- Ensure compatibility with:
  - `react`, `react-dom`
  - `zustand`
  - `framer-motion`
- Handles absolute imports (e.g., `src/...`) – make sure your build system resolves these paths.

---

### 4.2. EVENT LISTENER LIFECYCLE

- Global listeners are set in `App.tsx`, such as scroll and keyboard shortcuts
- These are initialized in `useEffect` hooks

**IMPORTANT:** You must clean up these listeners properly:

```ts
useEffect(() => {
  window.addEventListener('keydown', handleKey);
  return () => {
    window.removeEventListener('keydown', handleKey);
  };
}, []);
```

> Failure to clean up will cause memory leaks and keyboard shortcuts firing on unrelated routes.

---

### 4.3. CONCEPTUAL INTEGRATION STEPS

#### 🧱 DOM & Styling

- Wrap the component in a container with:
  - `position: relative`
  - `overflow: hidden`
  - A defined height
- Provide a scrollable element and pass its `ref` to:

```ts
useJourneyModeStore.getState().setScrollContainer(ref.current);
```

- You can override CSS variables for theming.

#### 💾 Data Hydration

- Fetch moon data on init
- Set using:

```ts
useJourneyModeStore.getState().setNodes(dataArray);
```

- Must match `ZoomNode` interface.

#### 🧭 Programmatic Control

- You can control internal state from outside via:

```ts
useJourneyModeStore.getState().setFocusedMoonIndex(2);
```

#### 🔁 State Management Bridge

If using Redux or other state managers:

- Create a "bridge" component
- Subscribe to external state and pass updates via Zustand actions:

```ts
useEffect(() => {
  if (externalFlag) {
    useJourneyModeStore.getState().setMode('detail');
  }
}, [externalFlag]);
```

> Never override Zustand state directly. Use the public API.

---

### 4.4. DEVELOPMENT AND DEBUGGING

#### 🧪 Debug Mode

- Press **`D`** to activate an overlay showing real-time Zustand state.

#### ⌨️ Keyboard Shortcuts

- `0`: Switch to `'overview'`
- `1`–`3`: Focus specific moons
- `A`: Trigger cutscene

---