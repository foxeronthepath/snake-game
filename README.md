# 🐍 Snake Game

A modern Snake game with AI autopilot modes built with HTML5, CSS3, and JavaScript.

**🎮 [Play the Game Live!](https://foxeronthepath.github.io/snake-game/)**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🎮 Features

- **Classic Snake Gameplay**: Collect food, grow longer, avoid collisions
- **Dual AI Autopilot Modes**: Smart AI with A* pathfinding and Lawnmower pattern AI
- **9 Speed Levels**: Cycle through fixed speed presets from 300ms to 1ms
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
- **,** (comma): Cycle to slower speed level
- **.** (period): Cycle to faster speed level

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
├── index.html          # Main HTML file
├── js/
│   ├── script.js       # Core game logic
│   └── autopilot.js    # AI autopilot systems
├── style.css           # Styling and animations
└── README.md           # This file
```

## 🛠️ Technical Details

- **Pure JavaScript**: No frameworks, ES6+ features
- **CSS Grid**: Responsive game board
- **Local Storage**: Theme preference persistence
- **Optimized Rendering**: Efficient DOM manipulation

**Enjoy the game! Try both AI modes and see which one performs better! 🐍🤖**