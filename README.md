# 🐍 Snake Game

A modern Snake game with AI autopilot modes built with HTML5, CSS3, and JavaScript.

**🎮 [Play the Game Live!](https://foxeronthepath.github.io/snake-game/)**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🎮 Features

- **Classic Snake Gameplay**: Collect food, grow longer, avoid collisions
- **Dual AI Autopilot Modes**: Smart AI with A* pathfinding and Lawnmower pattern AI
- **Manual Speed Control**: Adjust game speed in real-time with , and . keys
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
- **,** (comma): Decrease speed (slower)
- **.** (period): Increase speed (faster)

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