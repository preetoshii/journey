# Journey Page

An interactive interface featuring a central Sun and three Moons. Built with React, TypeScript, and Framer Motion.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd journeypage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   The app will be available at `http://localhost:5173`

## 🎯 Features

- **Interactive Moon System**: Smooth transitions between overview and detail views
- **Animated Backgrounds**: Dynamic backgrounds for focused moons
- **Responsive Design**: Works across different screen sizes
- **Accomplishment Cutscenes**: Animated sequences for celebrating achievements

## 🛠️ Tech Stack

- React
- TypeScript
- Vite
- Framer Motion (animations)
- Zustand (state management)

## 🎨 Project Structure

```
src/
├── components/
│   ├── Moon/              # Moon visualization components
│   │   ├── MoonNode.tsx       # Individual moon nodes
│   │   ├── MoonVisualizer.tsx # Main moon visualization
│   │   └── ...               # Other moon-related components
│   ├── Layout/           # Layout components
│   │   ├── OverviewArea.tsx  # Overview screen
│   │   └── DetailArea.tsx    # Detail screen
│   └── Cutscene/         # Cutscene components
│       └── ...           # Cutscene-related components
├── store/               # State management
│   └── useJourneyModeStore.ts
├── types/              # TypeScript type definitions
└── assets/            # Images, fonts, and animations
```

## 🎮 How to Use

1. **Overview Mode**
   - View the central Sun and three Moons
   - Click any Moon to enter detail mode
   - Scroll down to enter detail mode

2. **Detail Mode**
   - View detailed information about each moon
   - Click a Moon to focus it
   - Scroll up to return to overview mode

## 🎨 Styling

- Fonts: Ivar Headline (titles) and Sohne (subtitles)
- Colors: Custom color scheme for each moon
- Animations: Smooth transitions and effects using Framer Motion