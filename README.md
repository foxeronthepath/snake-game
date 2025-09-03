# 🐍 Snake Game

A modern Snake game with multiple AI autopilot modes and border wrap functionality built with HTML5, CSS3, and JavaScript.

![Snake Game Preview](assets/snake-game-preview.gif)

**🎮 [Play the Game Live!](https://foxeronthepath.github.io/snake-game/)**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🎮 Features

- **Classic Snake Gameplay**: Collect food, grow longer, avoid collisions
- **Border Wrap Mode**: Toggle between classic borders and wrap-around mode
- **Triple AI Autopilot System**: Smart AI, Borderless AI, and Lawnmower pattern AI
- **Intelligent Autopilot Switching**: AI automatically adapts to border mode
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
- **B**: Toggle border mode (borders on/off)
- **A**: Toggle Smart Autopilot (adapts to border mode)
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

## 🌀 Border Modes

The game features two distinct gameplay modes:

### 🚪 Classic Border Mode (Default)
- Snake dies when hitting the edges of the grid
- Traditional Snake gameplay experience
- Requires careful navigation around boundaries

### 🌀 Wrap-Around Mode
- Snake wraps around to the opposite side when hitting edges
- Hit left edge → appear on right edge
- Hit right edge → appear on left edge  
- Hit top edge → appear on bottom edge
- Hit bottom edge → appear on top edge
- Opens up new strategic possibilities and movement patterns

**Toggle between modes**: Press **B** key or click the border button during gameplay.

## 🤖 AI Autopilot Modes

The game features an intelligent triple autopilot system that automatically adapts to your border mode:

### Smart Autopilot (A) - Adaptive AI
![Smart Autopilot with Borders](assets/smart-autopilot-borders.gif)
- **Automatically switches** between two specialized algorithms:
  - **Normal Mode** (🚪 borders): Standard A* pathfinding with boundary avoidance
  - **Borderless Mode** (🌀 no borders): Wrap-aware A* pathfinding that utilizes edge wrapping
- Advanced collision avoidance with multiple fallback strategies
- Evaluates available space to prevent getting trapped
- Chooses shortest paths including wrap-around routes in borderless mode

### Smart Autopilot in Borderless Mode
![Smart Autopilot Borderless](assets/smart-autopilot-borderless.gif)
- Demonstrates wrap-aware pathfinding that utilizes edge wrapping
- Shows how the AI takes advantage of wrap-around routes for efficiency
- Seamlessly navigates through edges to reach food faster

### Lawnmower Autopilot (P) - Pattern-Based AI
![Lawnmower Autopilot Pattern](assets/lawnmower-autopilot.gif)
- Systematic pattern-based movement for complete grid coverage
- Uses fixed lawnmower pattern regardless of border mode
- **Unaffected by border mode changes** - maintains pattern consistency
- Designed for maximum coverage and efficiency
- Works in both border modes without switching algorithms

### 🔄 Intelligent Autopilot Switching
- **Border Mode Changes**: When using Smart Autopilot (A), changing border modes automatically switches to the appropriate AI algorithm
- **Lawnmower Immunity**: Lawnmower Autopilot (P) remains active and unchanged when border modes are switched
- **Seamless Transition**: No manual intervention required - the system handles everything automatically

## 🏗️ Project Structure

```
snake-game/
├── index.html          # Main HTML file with embedded game UI
├── js/
│   ├── script.js       # Core game logic, controls, and border modes
│   ├── autopilot.js    # Smart AI and Lawnmower autopilot systems
│   ├── borderless-autopilot.js  # Wrap-aware AI for borderless mode
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
- **Local Storage**: Theme and border mode preference persistence
- **Optimized Rendering**: Efficient DOM manipulation
- **Modular Architecture**: Separate autopilot modules for maintainability

**Enjoy the game! Try both border modes and all three AI modes to see which combination works best! 🐍🤖🌀**