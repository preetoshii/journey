# Journey Page: An Interactive Growth Visualizer

Welcome to the Journey Page, a highly interactive web application that re-imagines personal goal tracking as an animated celestial journey. This project uses the metaphor of a solar system—a central sun orbited by moons—to represent a user's core objectives and the progress made towards them. It is a showcase of modern frontend technologies, focusing on sophisticated state management, complex animations, and a polished, engaging user experience.

---

## ✨ Core Features

*   **Dual-View System**: Seamlessly transition between a high-level **Overview Mode** of all goals (moons) and a focused **Detail Mode** for a single goal.
*   **Scroll-Based Navigation**: An intuitive, primary navigation method that uses the scroll wheel to move between the overview and detail views, creating a natural vertical flow.
*   **Accomplishment Cutscenes**: A full-screen animated sequence celebrates major achievements. It features generative "star" particles that journey to the corresponding moon to visually deliver progress.
*   **Advanced Progress Visualization**:
    *   **`ArcProgressBar`**: A custom circular progress bar that animates smoothly to show overall completion of a goal area.
    *   **`SegmentedArcProgressBar`**: A more granular view where each segment of the arc represents a specific sub-goal, providing a detailed breakdown of progress.
*   **Rich, Interactive Animations**: Built with **Framer Motion**, the UI is filled with meaningful micro-interactions, including:
    *   Dynamic, animated SVG backgrounds for each moon that respond to user hover.
    *   Layout animations that smoothly reposition elements between views.
    *   Animated subtitles that cycle through key actions or mantras for each moon.
*   **Centralized State Management**: Powered by **Zustand**, the application state is managed in a single, lightweight store, making complex state transitions (like those in the cutscene) predictable and maintainable.
*   **Comprehensive Debug Mode**: A dedicated debug menu, toggled with the 'D' key, provides powerful keyboard shortcuts for developers to test different states, modes, and animations quickly.

---

## 🛠️ Tech Stack & Architectural Decisions

| Technology      | Purpose                                                                                                                                                                                            | Why it was chosen                                                                                                                                                                               |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React**       | UI Library                                                                                                                                                                                         | Provides a robust, component-based architecture, which is ideal for building a complex and modular UI.                                                                                          |
| **TypeScript**  | Language                                                                                                                                                                                           | Ensures type safety across the application, which is crucial for managing the complex state object and preventing bugs in a large codebase.                                                   |
| **Vite**        | Build Tool                                                                                                                                                                                         | Offers a significantly faster development experience with near-instant Hot Module Replacement (HMR), boosting productivity.                                                                     |
| **Zustand**     | State Management                                                                                                                                                                                   | Chosen for its minimal boilerplate and performance. It simplifies state management by avoiding the complexity of Redux while providing a powerful, centralized store for global state.         |
| **Framer Motion** | Animation Library                                                                                                                                                                                  | The premier choice for animation in React. It provides a simple, declarative API for complex layout animations, gestures, and physics-based transitions, powering the entire UI's fluid feel. |
| **Lottie**      | Animation Renderer                                                                                                                                                                                 | Used for the scroll-down indicator animation. Lottie allows for high-quality, lightweight vector animations that are easily integrated into web applications.                               |

---

## 🚀 Getting Started

1.  **Clone the Repository**
    ```bash
    git clone [repository-url]
    cd journeypage
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run the Development Server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Navigate to `http://localhost:5173`.

---


## 🎮 How to Use the Application

1.  **Overview Mode**: You begin in the `Overview`. Here, you see the sun and all its moons. This is your central dashboard.
2.  **Explore a Moon**: Hover over any moon to see its unique animated background and a rotating subtitle that hints at its purpose.
3.  **Enter Detail Mode**: To learn more about a moon, either **scroll down** or **click** on it. This triggers a smooth animated transition into `Detail Mode`.
4.  **View Details**: In `Detail Mode`, the selected moon is featured on one side, while its associated goals and progress appear on the other. The remaining moons are visible as small dots, allowing for quick navigation between them.
5.  **Return to Overview**: To go back to the main dashboard, simply **scroll all the way to the top** of the page.
6.  **Celebrate Achievements**: When a goal is completed, an **Accomplishment Cutscene** will play automatically, providing a visual reward for your progress.

---

## 🔬 Debug Mode & Developer Tools

*   **Activation**: Press the **`D`** key to toggle the debug overlay and enable keyboard shortcuts.
*   **Keyboard Shortcuts**:
    *   **`0`**: Return to Overview Mode.
    *   **`1`**, **`2`**, **`3`**: Instantly switch to Detail Mode and focus the corresponding moon.
    *   **`A`**: Trigger a test Accomplishment Cutscene.
    *   **`S`**: Toggle experimental scroll-snapping.
    *   **`C`**: Toggle experimental click-to-center logic.