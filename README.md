# 🐍 Snake Game

A modern Snake game with AI autopilot modes built with HTML5, CSS3, and JavaScript.

**🎮 [Play the Game Live!](https://foxeronthepath.github.io/snake-game/)**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🎮 Features

- **Classic Snake Gameplay**: Collect food, grow longer, avoid collisions
- **Dual AI Autopilot Modes**: Smart AI with A* pathfinding and Lawnmower pattern AI
- **9 Speed Levels**: Cycle through fixed speed presets from 300ms to 1ms
- **🎵 Audio System**: Sound effects and background music with volume controls
- **Theme Toggle**: Dark/light mode with persistence
- **Responsive Design**: Works on desktop and mobile
- **Animated Elements**: Snake head with directional eyes, pulsing food
- **Winning Condition**: Complete victory when covering the entire grid

## 🎯 Controls

- **Arrow Keys**: Move the snake
- **Spacebar**: Start/pause game
- **R**: Restart game
- **T**: Toggle theme
- **A**: Toggle Smart Autopilot (A* pathfinding)
- **P**: Toggle Lawnmower Autopilot (systematic pattern)
- **S**: Toggle sound effects on/off
- **M**: Toggle background music on/off
- **,** (comma): Cycle to slower speed level
- **.** (period): Cycle to faster speed level

## 🎵 Audio System

The game includes a comprehensive audio system with:

- **Sound Effects**: 
  - Eating food sound
  - Death/collision sound  
  - Victory/win sound
- **Background Music**: Looping music during gameplay
- **Volume Controls**: Separate sliders for sound effects and music
- **Toggle Controls**: Individual on/off switches for sounds and music
- **Persistent Settings**: Audio preferences saved in browser
- **Keyboard Shortcuts**: Quick S/M key toggles

### Audio Setup
1. Create a `sounds/` folder in your game directory
2. Add WAV audio files with these exact names:
   - `eat.wav` - Sound when eating food
   - `death.wav` - Sound when snake dies
   - `win.wav` - Sound when player wins  
   - `background.wav` - Background music (loops automatically)

The game works perfectly without audio files - they're completely optional!

## ⚡ Speed Levels

The game features 9 distinct speed levels you can cycle through:

1. **Level 1**: 300ms (slowest - strategic play)
2. **Level 2**: 200ms 
3. **Level 3**: 150ms (default starting speed) ⭐
4. **Level 4**: 100ms
5. **Level 5**: 50ms
6. **Level 6**: 25ms
7. **Level 7**: 10ms
8. **Level 8**: 5ms
9. **Level 9**: 1ms (fastest - lightning speed)

**Note**: Speed resets to Level 3 (150ms) when starting a new game.

## 🤖 AI Autopilot Modes

### Smart Autopilot (A)
- Uses A* pathfinding algorithm for optimal routes
- Advanced collision avoidance with fallback strategies
- Evaluates available space to prevent getting trapped

### Lawnmower Autopilot (P)
- Systematic pattern-based movement from the start
- Uses fixed lawnmower pattern for complete grid coverage
- Designed for maximum coverage and efficiency

## 🏗️ Project Structure

```
snake-game/
├── index.html          # Main HTML file with embedded game UI
├── js/
│   ├── script.js       # Core game logic and controls
│   ├── autopilot.js    # AI autopilot systems (A* & Lawnmower)
│   └── audio.js        # Audio system management
├── sounds/
│   ├── background.wav  # Background music (loops)
│   ├── eat.wav         # Food eating sound effect
│   ├── death.wav       # Game over sound effect
│   ├── win.wav         # Victory sound effect
│   └── README.md       # Audio system documentation
├── style.css           # Styling, animations, and themes
├── logo.png            # Game logo/icon
└── README.md           # This file
```

## 🛠️ Technical Details

- **Pure JavaScript**: No frameworks, ES6+ features
- **CSS Grid**: Responsive game board
- **Local Storage**: Theme preference persistence
- **Optimized Rendering**: Efficient DOM manipulation

**Enjoy the game! Try both AI modes and see which one performs better! 🐍🤖**