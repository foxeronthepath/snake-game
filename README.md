# Snake Game

A modern Snake game built with HTML5, CSS3, and JavaScript. Play manually or let one of three AI autopilots take over — including a Hamiltonian cycle solver — then benchmark them across hundreds of simulated games.

<div align="center">

<img src="assets/snake-game-preview.gif" alt="Snake Game Preview" width="600">

**[Play the Game Live](https://foxeronthepath.github.io/snake-game/)**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

</div>

## Features

- **Classic Snake gameplay** — collect food, grow longer, avoid collisions
- **Border wrap mode** — toggle between classic walls and wrap-around edges
- **Three AI autopilots** — Smart (A*), Lawnmower (pattern), and Hamilton Solver (cycle-based)
- **Adaptive Smart Autopilot** — automatically switches between bordered and wrap-aware A* when border mode changes
- **9 speed levels** — cycle through presets from 300 ms down to 1 ms per tick
- **Win condition** — fill the entire 20×20 grid to win
- **Audio system** — sound effects and background music with volume sliders and persistent settings
- **Snow effect** — optional decorative snowfall (toggle in the bottom-left corner)
- **Benchmark suite** — run parallel simulations to compare autopilot performance ([`benchmark.html`](benchmark.html))
- **Responsive design** — works on desktop and mobile

## Getting Started

No build step required. Open `index.html` in a browser, or serve the folder with any static file server:

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .
```

Then visit `http://localhost:8000`.

## Controls

| Key | Action |
|-----|--------|
| **Arrow keys** / **WASD** | Move the snake (held keys are buffered; most recent valid direction wins) |
| **Space** | Start / pause |
| **R** | Restart |
| **B** | Toggle border mode (walls vs wrap-around) |
| **I** | Toggle Smart Autopilot (adapts to border mode) |
| **P** | Toggle Lawnmower Autopilot |
| **H** | Toggle Hamilton Solver (bordered mode only) |
| **,** / **.** | Slower / faster speed level |
| **N** / **M** | Toggle sound effects / background music |

UI buttons are also available for start, pause, borders, help, and audio settings.

## Speed Levels

Nine fixed presets, cycled with **,** and **.**:

| Level | Interval | Notes |
|-------|----------|-------|
| 1 | 300 ms | Slowest |
| 2 | 200 ms | |
| 3 | 150 ms | Default (resets on new game) |
| 4 | 100 ms | |
| 5 | 50 ms | |
| 6 | 25 ms | |
| 7 | 10 ms | |
| 8 | 5 ms | |
| 9 | 1 ms | Fastest |

## Border Modes

### Classic Borders (default)

The snake dies when it hits the edge of the grid.

### Wrap-Around

The snake reappears on the opposite side when crossing an edge. Hamilton Solver is disabled in this mode because it relies on a fixed Hamiltonian cycle over the bordered grid.

Toggle with **B** or the Borders button. The preference is saved in `localStorage`.

## AI Autopilots

Only one autopilot can be active at a time. Press the corresponding key during a running game to toggle it on or off.

### Smart Autopilot (**I**)

Uses A* pathfinding with collision avoidance and fallback strategies.

- **Bordered mode** — standard A* that avoids walls
- **Wrap-around mode** — wrap-aware A* that can route through edges

When border mode changes while Smart Autopilot is on, the correct algorithm is swapped automatically.

### Lawnmower Autopilot (**P**)

Follows a fixed systematic pattern for broad grid coverage. Unaffected by border mode changes.

### Hamilton Solver (**H**)

Follows a precomputed Hamiltonian cycle over the grid and takes safe shortcuts toward food when possible. In the endgame (≥ 98% grid fill), shortcuts are disabled and only cycle steps are used. Available in bordered mode only.

## Benchmark

Open [`benchmark.html`](benchmark.html) (or click **Benchmark** on the main game page) to stress-test autopilots.

- **10 parallel grids** per round
- **Configurable rounds** — 1, 3, 5 (default), 10, or 20
- **Autopilot selection** — Hamilton Solver, Smart Autopilot, or Lawnmower
- **Simulation speed** — Normal (150 ms), Fast (10 ms), Turbo (1 ms), or Extreme (1 ms burst)
- **Final report** — win rate, per-round breakdown, score/duration charts, and per-game details

Benchmark settings are persisted in `localStorage`. Simulations always run in bordered mode.

## Audio

Place optional WAV files in the `sounds/` folder:

| File | Purpose |
|------|---------|
| `eat.wav` | Eating food |
| `death.wav` | Game over |
| `win.wav` | Victory |
| `background.wav` | Looping background music |

The game works without audio files. Volume and on/off preferences are saved in the browser. See [`sounds/README.md`](sounds/README.md) for format notes.

## Project Structure

```
snake-game/
├── index.html              # Main game
├── benchmark.html          # Autopilot benchmark page
├── benchmark.css           # Benchmark-specific styles
├── style.css               # Game styles and animations
├── assets/
│   ├── favicon.png
│   ├── logo.png
│   └── snake-game-preview.gif
├── js/
│   ├── script.js           # Core game logic, controls, border modes
│   ├── autopilot.js        # Smart and Lawnmower autopilots
│   ├── borderless-autopilot.js  # Wrap-aware A* for borderless mode
│   ├── hamilton-solver.js  # Hamiltonian cycle solver
│   ├── audio.js            # Audio manager
│   ├── snow.js             # Snow particle effect
│   └── benchmark.js        # Parallel simulation and reporting
└── sounds/                 # Optional WAV audio files
```

## Technical Notes

- Pure JavaScript — no frameworks, ES6+
- 20×20 CSS Grid board with efficient DOM updates
- `localStorage` for border mode, audio, and benchmark preferences
- Modular autopilot architecture — each AI in its own file

Enjoy the game — try every autopilot and border mode combination.
