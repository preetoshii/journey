# JOURNEY PAGE: DEFINITIVE TECHNICAL DEVELOPER GUIDE

---

## SECTION 1: INTRODUCTION AND CORE CONCEPTS

This document provides an in-depth technical breakdown of the Journey Page application. The primary goal is to equip any developer with the necessary knowledge to understand, maintain, and integrate this module into a larger host application.

The Journey Page is not just a set of components; it is a self-contained, state-driven system. It is designed to be a highly interactive and visually rich experience. The core concepts are:

### 🧠 A Centralized State Machine

A single Zustand store (`useJourneyModeStore.ts`) acts as the "brain" and the single source of truth for the entire application. All UI states, data, user interactions, and animation sequences are managed through this store. This centralized model makes the application's behavior predictable, reproducible, and easier to debug. Interacting with the application means interacting with the store.

### 🖱️ Scroll-Driven Interface

The primary mode of navigation is the user's scroll position. The application is built around a scrollable container and uses an `IntersectionObserver` to listen to which content area is in view. It then translates the user's physical scroll position into state changes within the central store, creating a seamless and interactive journey through the content without traditional "click-to-navigate" patterns.

### 🌓 Two-Mode View System

The application operates in two primary modes, which dictate the layout and visibility of components:

-   `'overview'`: All "moons" (the visual representation of a `ZoomNode`) are visible in a condensed, top-level layout. This provides a high-level summary of the entire journey.
-   `'detail'`: A single moon is brought into focus, and its detailed content (including its list of `Goal`s) is displayed alongside it. The transition between these modes is fully animated using Framer Motion.

### 🔗 Decoupled Data and View

The components are designed to be agnostic about the specific data they display. The data (an array of `ZoomNode` objects) is hydrated into the state store, and the components simply render based on the current state. This decouples the view layer from the data layer, allowing for easy integration with any backend or data source, as long as the data contract is respected.

---

## SECTION 2: CORE DATA STRUCTURES (THE DATA CONTRACT)

To integrate the Journey Page, the host application must provide data that conforms to the following TypeScript interfaces. Understanding the distinction between these structures is critical for working with the application.

```ts
// Represents a single "moon" or primary topic in the journey.
// This is the core data object for the application.
interface ZoomNode {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  goals: Goal[];
  icon: string;
  isCore: boolean;
}

// Represents a single task or objective associated with a ZoomNode.
// This is a persistent data structure that tracks the status of a task.
interface Goal {
  id:string;
  title: string;
  isCompleted: boolean;
}

// Represents the data payload for the cutscene that celebrates a Goal's completion.
// This is a temporary, event-driven object used only to trigger the animation.
interface Accomplishment {
  nodeId: string;
  goal: Goal;
}
```

### **Critical Distinction 1: `ZoomNode` vs. "Moon"**

-   **`ZoomNode`**: This is the name of the core data interface in the code. It holds all the information for a single topic point in the journey.
-   **"Moon"**: This is the thematic and visual name used throughout the UI and in component names (`MoonNode.tsx`, `MoonVisualizer.tsx`). When you see "Moon" in the component layer, know that it is the **visual representation of a `ZoomNode` data object.**

### **Critical Distinction: `Goal` vs. `CutsceneTrigger`**

This is the most important conceptual distinction to grasp for understanding the application's event flow. **They are not the same thing.**

-   **`Goal`**: This is a **persistent data object**. It represents a single task that is part of a `ZoomNode`'s checklist. It lives inside the `ZoomNode.goals` array and its `isCompleted` status is part of the application's permanent state.

-   **`CutsceneTrigger`**: This is a **temporary, event-driven object**. Its sole purpose is to **trigger and provide data for the cutscene animation**. It is created on the fly when a `Goal` is completed, passed to the `triggerCutscene` function, and then discarded after the animation is finished. It is the payload that tells the cutscene *what* to celebrate.

> **Note on Naming**: You will see the term `Accomplishment` used in the code, specifically for the cutscene's data structure (`accomplishmentTypes.ts`) and the overlay component (`AccomplishmentCutsceneOverlay.tsx`). This is a legacy name. For conceptual understanding, you should think of an "Accomplishment" as a `CutsceneTrigger`.

---

## SECTION 3: ARCHITECTURE DEEP DIVE

### 3.1. STATE MANAGEMENT (`useJourneyModeStore.ts`)

Understanding the state store is the single most critical part of understanding this application. It is the **single source of truth**.

#### 🧾 Properties

-   `mode: 'overview' | 'detail'`
-   `focusedMoonIndex: number`
-   `nodes: ZoomNode[]`
-   `scrollContainer: HTMLDivElement | null`
-   `isAutoScrolling: boolean`
-   `isDebugMode: boolean`
-   `isCutsceneActive: boolean`
-   `cutsceneStep: CutsceneStep`
-   `currentAccomplishments: Accomplishment[] | null`
-   `pendingGoalUpdates: Record<string, any>`: A temporary object holding the future state of a `ZoomNode` during a cutscene. For example, `{ "node-id-123": { progress: 100 } }`.
-   `pulseMoons: Record<string, boolean>`

#### 🛠️ Actions (Public API)

-   `setMode`
-   `setFocusedMoonIndex`
-   `setNodes`
-   `setScrollContainer`
-   `triggerCutscene(accomplishments: Accomplishment[])`

### 3.2. THE CUTSCENE SUBSYSTEM (`AccomplishmentCutsceneOverlay.tsx`)

The cutscene is a multi-step process orchestrated by the state store to provide rich, animated feedback when a goal is completed.

#### 🔁 Flow

1.  **Initiation**: An external event (e.g., a button click) calls `triggerCutscene(accomplishments)` with an array of `Accomplishment` objects.

2.  **Preparation** (`_prepareCutsceneState`): The store sets `isCutsceneActive = true`, populates `currentAccomplishments` with the payload, and calculates the future state of the affected `ZoomNode`s. This future state is held in `pendingGoalUpdates`. The main `nodes` state is **not yet updated.**

3.  **Rendering** (`AccomplishmentCutsceneOverlay.tsx`): This component listens to `isCutsceneActive` and `currentAccomplishments`. When active, it renders the entire cutscene animation sequence based on the `cutsceneStep` property.

4.  **State Application** (`_applyPendingChanges`): Once the animation reaches the correct point, this function is called. It merges the `pendingGoalUpdates` into the main `nodes` state, which officially updates the `Goal`'s `isCompleted` status in the UI data.

5.  **Conclusion** (`_endCutscene`): This final step resets all cutscene-related state properties and unlocks the UI for user interaction.

### 3.3. LAYOUT & ANIMATION ENGINE (`MoonVisualizer.tsx`)

This component is the master positioner for all moons on screen.
- It reads `mode` and `focusedMoonIndex` from the store.
- It calculates the final `(x, y)` coordinates and `scale` for each moon based on the current mode.
- It passes these calculated layout values as props to each individual `MoonNode`.
- It uses Framer Motion's `layoutId` property to create seamless, automatic animations as the layout values change between 'overview' and 'detail' modes.

### 3.4. SCROLL-TO-FOCUS MECHANISM (`DetailArea.tsx`)

This component uses an `IntersectionObserver` to track the user's scroll focus.
- It is only visible in `'detail'` mode.
- It renders the long-form content for every `ZoomNode` in a single vertical column.
- Each section has a "trigger" element that is watched by the observer.
- When a trigger becomes the most visible one on screen, the component calls `setFocusedMoonIndex` in the store, keeping the application state perfectly in sync with the scroll position.

---


## SECTION 4: DEVELOPMENT AND DEBUGGING

#### 🧪 Debug Mode

A debug panel can be toggled via the Settings icon in the UI. This panel allows you to:
- Manually change the `mode` between `'overview'` and `'detail'`.
- Force-focus a specific moon by its index.
- Inspect the raw `ZoomNode` data.
- Construct and trigger a test `Accomplishment` cutscene.

---

## SECTION 5: PORTING GUIDE & KNOWN QUIRKS

This section contains critical information for any developer tasked with integrating the Journey Page into a larger host application. The component makes several key assumptions about its environment which must be respected for it to function correctly.

### **Quirk 1: The Scrolling Container**

This is the most critical requirement. The component's scroll-driven focus mechanism **does not use the main browser window for scrolling**. It requires a specific nested DOM structure.

**Requirement:** You **MUST** provide a parent container with `overflow: hidden` and, inside of it, a child container with `overflow-y: scroll`. The `ref` for this *inner scrolling child* is what must be passed to the `setScrollContainer` action.

**Example DOM Structure:**
```html
<!-- The Host Application Wrapper -->
<div id="host-app">

  <!-- 1. The Parent Container MUST have overflow: hidden and a defined height -->
  <div style="height: 100vh; position: relative; overflow: hidden;">

    <!-- This is where you will render the Journey Page component, which contains the inner div -->
    
  </div>

</div>
```
Inside the Journey Page component, you will have the scrollable div:
```html
    <!-- 2. The Inner Container MUST have overflow-y: scroll -->
    <!-- This is the element whose ref must be passed to the store -->
    <div ref={scrollRef} style="height: 100%; overflow-y: scroll;">
       <!-- The DetailArea content will be rendered here and will scroll within this div -->
    </div>
```

**Why is it like this?** The `IntersectionObserver` in `DetailArea.tsx` is bound to this specific inner container. If this structure is not replicated, the observer will not detect content scrolling into view, and the component will not be able to switch focus between moons in `'detail'` mode.

### **Quirk 2: The Default Background**

The component includes its own background (`BackgroundLayer.tsx`). In most integrations, you will want to disable this to use the host application's universal background.

**Requirement:** To disable the default background, you do not need to change the code. Simply override the relevant CSS class in your own stylesheet.

**Example CSS Override:**
```css
/* In your host application's global stylesheet */
.background-layer {
  display: none !important;
}
```

### **Quirk 3: Z-Index Stacking**

The component contains several overlay elements with hardcoded `z-index` values, which may conflict with overlays in the host application (e.g., modals, headers, cookie banners).

**Hardcoded Values:**
-   `AccomplishmentCutsceneOverlay.tsx`: `z-index: 100`
-   `DebugSidebar.tsx`: `z-index: 200`

**Requirement:** Be aware of these values. If you experience issues where the cutscene is appearing behind or in front of other elements unexpectedly, you will need to override these values in your own CSS. It is recommended to create a unified `z-index` strategy for your application and adjust these accordingly.