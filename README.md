# 🐍 Snake Game

A modern, feature-rich implementation of the classic Snake game built with HTML5, CSS3, and JavaScript. Play the game live at [https://foxeronthepath.github.io/snake-game/](https://foxeronthepath.github.io/snake-game/).

![Snake Game](https://img.shields.io/badge/Game-Snake%20Game-green) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🎮 Features

### Core Gameplay
- **Classic Snake Mechanics**: Control a growing snake to collect food and avoid collisions
- **Smooth Movement**: Responsive arrow key controls with collision detection
- **Score System**: Earn 10 points for each food item consumed
- **Game States**: Start, pause, resume, and restart functionality

### Advanced Features
- **🌙 Dark/Light Theme**: Toggle between themes with the 'T' key or theme switch
- **🤖 Autopilot Mode**: Press 'A' to enable AI-controlled snake movement
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **💾 Theme Persistence**: Your theme preference is saved in localStorage
- **🎯 Smart AI**: Autopilot uses pathfinding algorithms to find food efficiently

### Visual Enhancements
- **Animated Snake Head**: Directional eyes that follow the snake's movement
- **Pulsing Food**: Animated food items with smooth transitions
- **Modern UI**: Clean, minimalist design with smooth animations
- **Game Over Modal**: Elegant modal with restart functionality

## 🎯 How to Play

### Basic Controls
- **Arrow Keys**: Move the snake (Up, Down, Left, Right)
- **Spacebar**: Start game or pause/resume
- **R**: Restart the game
- **T**: Toggle between light and dark themes
- **A**: Toggle autopilot mode (when game is running)

### Game Rules
1. Control the snake to eat the red food
2. Each food item increases your score by 10 points
3. The snake grows longer with each food consumed
4. Avoid hitting walls or the snake's own body
5. Game ends on collision - try to achieve the highest score!

## 🚀 Getting Started

### Live Demo
Visit the live game at: **[https://foxeronthepath.github.io/snake-game/](https://foxeronthepath.github.io/snake-game/)**

### Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/foxeronthepath/snake-game.git
   cd snake-game
   ```

2. **Open in browser**:
   - Simply open `index.html` in your web browser
   - Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Start playing**:
   - Click "Start Game" or press Spacebar
   - Use arrow keys to control the snake
   - Press 'A' to try the autopilot feature!

## 🏗️ Project Structure

```
snake-game/
├── index.html          # Main HTML file
├── script.js           # Core game logic
├── autopilot.js        # AI autopilot functionality
├── style.css           # Styling and animations
└── README.md           # Project documentation
```

## 🧠 Autopilot AI

The game features an intelligent autopilot system that can play the game automatically:

- **Pathfinding Algorithm**: Uses Manhattan distance to find the shortest path to food
- **Collision Avoidance**: Intelligently avoids walls and snake body
- **Smart Movement**: Prevents immediate reversals that would cause death
- **Toggle Control**: Press 'A' during gameplay to enable/disable

### How the AI Works
1. **Safety Check**: Evaluates all possible moves for immediate collisions
2. **Distance Calculation**: Calculates Manhattan distance to food for each safe move
3. **Optimal Choice**: Selects the move that gets closest to the food
4. **Fallback Strategy**: Continues in current direction if no safe moves exist

## 🎨 Customization

### Theme Customization
The game supports both light and dark themes with CSS custom properties:

```css
:root {
  --bg-color: #f0f0f0;
  --text-color: #333;
  --snake-color: #00c206;
  --food-color: #f44336;
  /* ... more variables */
}
```

### Game Settings
Modify game constants in `script.js`:

```javascript
const GRID_SIZE = 20;        // Game board size
const CELL_SIZE = 20;        // Cell size in pixels
const GAME_SPEED = 100;      // Game speed in milliseconds
```

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup and accessibility features
- **CSS3**: Modern styling with custom properties and animations
- **Vanilla JavaScript**: No frameworks, pure ES6+ JavaScript
- **Responsive Design**: Mobile-first approach with flexible layouts

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Performance Features
- **Efficient Rendering**: Optimized DOM manipulation
- **Smooth Animations**: CSS transitions and transforms
- **Memory Management**: Proper cleanup of event listeners
- **Responsive Controls**: Debounced input handling

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Ideas for Contributions
- 🎵 Sound effects and background music
- 🏆 High score leaderboard
- 🎮 Touch controls for mobile
- 🎨 Additional themes and customization options
- 🧠 Improved AI algorithms
- 📊 Game statistics and analytics

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Classic Snake game concept
- Modern web development best practices
- CSS animations and transitions
- JavaScript ES6+ features
- Responsive design principles

## 📞 Contact

- **Live Demo**: [https://foxeronthepath.github.io/snake-game/](https://foxeronthepath.github.io/snake-game/)
- **GitHub**: [foxeronthepath/snake-game](https://github.com/foxeronthepath/snake-game)

---

**Enjoy playing Snake! 🐍✨**

*Press 'A' to watch the AI play, or use arrow keys to control the snake yourself!*