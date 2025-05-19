# Journey Page

An interactive, zoomable interface featuring a central Sun and three Moons. Built with React, TypeScript, and Framer Motion.

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

- **Interactive Zoom Levels**: Smooth transitions between different views
- **Magnetic Snapping**: Moons snap into place when dragged
- **Sound Effects**: Musical feedback on interactions
- **Animated Backgrounds**: Dynamic backgrounds for focused moons
- **Responsive Design**: Works across different screen sizes

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
│   └── ZoomWorld/         # Main zoomable interface
│       ├── SunMoonNode.tsx    # Individual sun/moon nodes
│       ├── ZoomControls.tsx   # Zoom in/out controls
│       └── usePanning.ts      # Panning and snapping logic
├── types.ts               # TypeScript type definitions
└── assets/               # Images, fonts, and sounds
```

## 🎮 How to Use

1. **Level 1 (Overview)**
   - View the central Sun and three Moons
   - Click any Moon to zoom in
   - Use the zoom-in button in the bottom right

2. **Level 2 (Detail)**
   - Drag to pan around
   - Moons will snap into place when released
   - Click a Moon to focus it
   - Use the zoom-out button to return to Level 1

## 🎵 Sound Effects

The interface includes:
- Pentatonic notes when focusing moons
- Zoom in/out sounds
- Button click feedback

## 🎨 Styling

- Fonts: Ivar Headline (titles) and Sohne (subtitles)
- Colors: Custom color scheme for each moon
- Animations: Spring physics for natural movement

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## 📝 Notes

- The interface is designed to be modular and extensible
- All animations use Framer Motion for smooth transitions
- State management is handled through Zustand for simplicity

## 🐛 Known Issues

- None at the moment

## 🔜 Future Improvements

- Additional zoom levels
- More interactive elements
- Enhanced sound design
- Performance optimizations

## 📫 Questions?

Feel free to reach out to the team or create an issue in the repository.
