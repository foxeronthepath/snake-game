const GRID_SIZE = 20;
const CELL_SIZE = 20;
let score = 0;
const SPEED_LEVELS = [300, 200, 150, 100, 50, 25, 10, 5, 1]; 
const DEFAULT_SPEED_INDEX = 2; 
let currentSpeedIndex = DEFAULT_SPEED_INDEX;
let currentSpeed = SPEED_LEVELS[currentSpeedIndex];
const INITIAL_POSITION = { x: 10, y: 10 };
const DIRECTIONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
};

let snake = [{ ...INITIAL_POSITION }];
let food = { x: 15, y: 15 };
let direction = DIRECTIONS.RIGHT;
let nextDirection = DIRECTIONS.RIGHT;
let gameInterval;
let gameRunning = false;
let gamePaused = false;
let isDarkMode = false;
let borderWrapMode = false;

const gridElement = document.getElementById("grid");
const scoreElement = document.getElementById("score");
const startButton = document.getElementById("start-btn");
const pauseButton = document.getElementById("pause-btn");
const helpButton = document.getElementById("help-btn");
const borderModeButton = document.getElementById("border-mode-btn");
const controlHints = document.getElementById("control-hints");
const themeToggle = document.getElementById("theme-switch-checkbox");

function toggleTheme() {
  isDarkMode = !isDarkMode;

  const theme = isDarkMode ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.checked = isDarkMode;

  localStorage.setItem("snakeTheme", theme);
}

function toggleHelp() {
  controlHints.classList.toggle("hidden");

  if (controlHints.classList.contains("hidden")) {
    helpButton.textContent = "Help";
  } else {
    helpButton.textContent = "Hide Help";
    
    setTimeout(() => {
      controlHints.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'nearest'
      });
    },50); 
  }
}

function toggleBorderMode() {
  borderWrapMode = !borderWrapMode;
  
  if (borderWrapMode) {
    borderModeButton.textContent = "No Borders";
    borderModeButton.classList.add("wrap-mode");
    borderModeButton.title = "Border Wrap Mode ON - Snake wraps around edges";
  } else {
    borderModeButton.textContent = "Borders";
    borderModeButton.classList.remove("wrap-mode");
    borderModeButton.title = "Border Wrap Mode OFF - Snake dies at edges";
  }
  
  switchAutopilotForBorderMode();
  
  localStorage.setItem("snakeBorderWrapMode", borderWrapMode.toString());
  
  console.log(`🌀 Border wrap mode ${borderWrapMode ? 'enabled' : 'disabled'}`);
}

function switchAutopilotForBorderMode() {
  const wasSmartAutopilotActive = autopilot.isActive() || borderlessAutopilot.isActive();
  
  if (wasSmartAutopilotActive) {
    if (autopilot.isActive()) autopilot.toggle();
    if (borderlessAutopilot.isActive()) borderlessAutopilot.toggle();
    
    if (borderWrapMode) {
      borderlessAutopilot.toggle();
      console.log("🔄 Switched to borderless autopilot for wrap mode");
    } else {
      autopilot.toggle();
      console.log("🔄 Switched to normal autopilot for border mode");
    }
  }
  
  if (lawnmowerAutopilot.isActive()) {
    console.log("🚜 Lawnmower autopilot remains active - border mode change ignored");
  }
}

function increaseSpeed() {
  console.log(
    `🚀 increaseSpeed() called! Current index: ${currentSpeedIndex}, speed: ${currentSpeed}ms`
  );
  if (currentSpeedIndex < SPEED_LEVELS.length - 1) {
    const oldSpeed = currentSpeed;
    const oldIndex = currentSpeedIndex;
    currentSpeedIndex++;
    currentSpeed = SPEED_LEVELS[currentSpeedIndex];
    console.log(
      `🚀 Speed level changed from ${oldIndex}(${oldSpeed}ms) to ${currentSpeedIndex}(${currentSpeed}ms)`
    );
    updateGameSpeed();
    console.log(
      `🚀 Speed increased! Level ${currentSpeedIndex + 1}/${
        SPEED_LEVELS.length
      }: ${currentSpeed}ms`
    );
  } else {
    console.log(
      `🚀 Cannot increase speed - already at fastest level: ${currentSpeed}ms`
    );
  }
}

function decreaseSpeed() {
  console.log(
    `🐌 decreaseSpeed() called! Current index: ${currentSpeedIndex}, speed: ${currentSpeed}ms`
  );
  if (currentSpeedIndex > 0) {
    const oldSpeed = currentSpeed;
    const oldIndex = currentSpeedIndex;
    currentSpeedIndex--;
    currentSpeed = SPEED_LEVELS[currentSpeedIndex];
    console.log(
      `🐌 Speed level changed from ${oldIndex}(${oldSpeed}ms) to ${currentSpeedIndex}(${currentSpeed}ms)`
    );
    updateGameSpeed();
    console.log(
      `🐌 Speed decreased! Level ${currentSpeedIndex + 1}/${
        SPEED_LEVELS.length
      }: ${currentSpeed}ms`
    );
  } else {
    console.log(
      `🐌 Cannot decrease speed - already at slowest level: ${currentSpeed}ms`
    );
  }
}

function updateGameSpeed() {
  console.log(
    `⚙️ updateGameSpeed() called! gameRunning: ${gameRunning}, gamePaused: ${gamePaused}, currentSpeed: ${currentSpeed}ms`
  );
  if (gameRunning && !gamePaused) {
    console.log(
      `⚙️ Clearing old interval and setting new one with ${currentSpeed}ms`
    );
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, currentSpeed);
    console.log(`⚙️ New game interval set successfully`);
  } else {
    console.log(`⚙️ Game not running or paused - interval not updated`);
  }
}

function initializeGrid() {
  gridElement.innerHTML = "";

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${x}-${y}`;
      gridElement.appendChild(cell);
    }
  }
  updateDisplayStart()
}

function generateFood() {
  let newFood;
  let attempts = 0;
  const totalCells = GRID_SIZE * GRID_SIZE;
  const emptyCells = totalCells - snake.length;

  do {
    attempts++;
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (
    snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
  );

  food = newFood;
}

function updateDisplay(skipFood = false) {
  clearGameElements();

  drawSnakeBody();

  if (snake.length > 0) {
    drawSnakeHead();
  }

  if (!skipFood) {
    drawFood();
  }

  scoreElement.textContent = score;
}

function updateDisplayStart() {
  clearGameElements();

  drawSnakeBody();

  if (snake.length > 0) {
    drawSnakeHead();
  }
}


function clearGameElements() {
  document
    .querySelectorAll(".snake, .snake-head, .food, .snake-eye")
    .forEach((element) => {
      element.classList.remove("snake", "snake-head", "food");

      const eyes = element.querySelectorAll(".snake-eye");
      eyes.forEach((eye) => eye.remove());
    });
}

function drawSnakeBody() {
  for (let i = 1; i < snake.length; i++) {
    const segment = snake[i];
    const cell = document.getElementById(`cell-${segment.x}-${segment.y}`);
    if (cell) cell.classList.add("snake");
  }
}

function drawSnakeHead() {
  const head = snake[0];
  const headCell = document.getElementById(`cell-${head.x}-${head.y}`);

  if (!headCell) return;

  headCell.classList.add("snake-head");
  headCell.style.position = "relative";

  const leftEye = document.createElement("div");
  const rightEye = document.createElement("div");
  leftEye.className = "snake-eye";
  rightEye.className = "snake-eye";

  headCell.appendChild(leftEye);
  headCell.appendChild(rightEye);

  const eyePositions = {
    [DIRECTIONS.UP]: {
      left: { top: "20%", left: "20%" },
      right: { top: "20%", right: "20%" },
    },
    [DIRECTIONS.DOWN]: {
      left: { bottom: "20%", left: "20%" },
      right: { bottom: "20%", right: "20%" },
    },
    [DIRECTIONS.LEFT]: {
      left: { top: "20%", left: "20%" },
      right: { bottom: "20%", left: "20%" },
    },
    [DIRECTIONS.RIGHT]: {
      left: { top: "20%", right: "20%" },
      right: { bottom: "20%", right: "20%" },
    },
  };

  const positions = eyePositions[direction];
  Object.assign(leftEye.style, positions.left);
  Object.assign(rightEye.style, positions.right);
}

function drawFood() {
  const foodCell = document.getElementById(`cell-${food.x}-${food.y}`);
  if (foodCell) foodCell.classList.add("food");
}

function checkCollision() {
  const head = snake[0];

  // Only check border collision if wrap mode is disabled
  if (!borderWrapMode) {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
  }

  // Check self-collision
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      return true;
    }
  }

  return false;
}

function moveSnake() {
  // Use autopilot based on border mode and what's active
  if (borderlessAutopilot.isEnabled()) {
    const borderlessDirection = borderlessAutopilot.getNextDirection(
      snake,
      food,
      direction,
      GRID_SIZE
    );
    if (borderlessDirection) {
      nextDirection = borderlessDirection;
    }
  } else if (autopilot.isEnabled()) {
    const autopilotDirection = autopilot.getNextDirection(
      snake,
      food,
      direction,
      GRID_SIZE
    );
    if (autopilotDirection) {
      nextDirection = autopilotDirection;
    }
  } else if (lawnmowerAutopilot.isEnabled()) {
    const lawnmowerDirection = lawnmowerAutopilot.getNextDirection(
      snake,
      food,
      direction,
      GRID_SIZE
    );
    if (lawnmowerDirection) {
      nextDirection = lawnmowerDirection;
    }
  }

  direction = nextDirection;

  const head = { ...snake[0] };
  switch (direction) {
    case DIRECTIONS.UP:
      head.y--;
      break;
    case DIRECTIONS.DOWN:
      head.y++;
      break;
    case DIRECTIONS.LEFT:
      head.x--;
      break;
    case DIRECTIONS.RIGHT:
      head.x++;
      break;
  }

  // Handle border wrapping if enabled
  if (borderWrapMode) {
    if (head.x < 0) {
      head.x = GRID_SIZE - 1;
    } else if (head.x >= GRID_SIZE) {
      head.x = 0;
    }
    
    if (head.y < 0) {
      head.y = GRID_SIZE - 1;
    } else if (head.y >= GRID_SIZE) {
      head.y = 0;
    }
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    
    // Play eat sound effect
    if (window.audioManager) {
      audioManager.playEatSound();
    }

    // Check for winning condition: if snake would cover all cells after eating
    if (snake.length === GRID_SIZE * GRID_SIZE - 1) {
      // Find the last empty cell and place food there
      let foundEmptyCell = false;
      for (let y = 0; y < GRID_SIZE && !foundEmptyCell; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const isOccupied = snake.some(
            (segment) => segment.x === x && segment.y === y
          );
          if (!isOccupied) {
            food = { x, y }; // Place food in the last empty cell
            foundEmptyCell = true;
            break;
          }
        }
      }

      updateDisplay(); // Show the final winning state with food in last empty cell
      
      // Play win sound effect
      if (window.audioManager) {
        audioManager.playWinSound();
      }
      
      endGame(true); // Pass true to indicate winning
      console.log("🎉 YOU WIN! 🎉");
      return;
    }

    generateFood();
  } else {
    snake.pop();
  }

  if (checkCollision()) {
    // Play death sound effect
    if (window.audioManager) {
      audioManager.playDeathSound();
    }
    
    endGame();
    return;
  }

  updateDisplay();
}

function gameLoop() {
  moveSnake();
}

function startGame(isRestart = false) {
  if (gameRunning && !isRestart) {
    startGame(true);
    return;
  }

  if (isRestart) {
    clearInterval(gameInterval);
  }

  snake = [{ ...INITIAL_POSITION }];
  direction = DIRECTIONS.RIGHT;
  nextDirection = DIRECTIONS.RIGHT;
  score = 0;
  currentSpeedIndex = DEFAULT_SPEED_INDEX; // Reset to default speed level
  currentSpeed = SPEED_LEVELS[currentSpeedIndex];
  gameRunning = true;
  gamePaused = false;

  generateFood();

  startButton.textContent = "Restart Game";
  pauseButton.textContent = "Pause";
  pauseButton.classList.remove("hidden");

  // Reset all autopilots when starting new game
  autopilot.reset();
  borderlessAutopilot.reset();
  lawnmowerAutopilot.reset();

  console.log(
    `🎮 Game started with speed level ${currentSpeedIndex + 1}/${
      SPEED_LEVELS.length
    }: ${currentSpeed}ms (Available levels: ${SPEED_LEVELS.join(", ")}ms)`
  );
  
  // Start background music
  if (window.audioManager) {
    audioManager.playBackgroundMusic();
  }
  
  gameInterval = setInterval(gameLoop, currentSpeed);

  updateDisplay();
}

function restartGame() {
  startGame(true);
}

function togglePause() {
  if (gamePaused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

function pauseGame() {
  if (!gameRunning || gamePaused) return;

  clearInterval(gameInterval);
  gamePaused = true;
  pauseButton.textContent = "Resume";
  
  // Pause background music
  if (window.audioManager) {
    audioManager.pauseBackgroundMusic();
  }
}

function resumeGame() {
  if (!gameRunning || !gamePaused) return;

  gameInterval = setInterval(gameLoop, currentSpeed);
  gamePaused = false;
  pauseButton.textContent = "Pause";
  
  // Resume background music
  if (window.audioManager) {
    audioManager.resumeBackgroundMusic();
  }
}

function endGame(isWin = false) {
  clearInterval(gameInterval);

  gameRunning = false;
  gamePaused = false;

  pauseButton.classList.add("hidden");
  pauseButton.textContent = "Pause";
  startButton.textContent = "Start Game";

  // Stop background music
  if (window.audioManager) {
    audioManager.stopBackgroundMusic();
  }

  // Reset all autopilots when game ends
  autopilot.reset();
  borderlessAutopilot.reset();
  lawnmowerAutopilot.reset();

  showGameOverModal(score, isWin);
}

function showGameOverModal(finalScore, isWin = false) {
  const modal = document.getElementById("game-over-modal");
  const modalTitle = modal.querySelector("h2");
  const scoreText = document.getElementById("final-score");

  if (isWin) {
    modalTitle.textContent = "🎉 YOU WIN! 🎉";
    scoreText.textContent = `Congratulations!\nFinal score: ${finalScore}`;
    scoreText.style.whiteSpace = "pre-line"; // Allow line breaks
  } else {
    modalTitle.textContent = "Game Over!";
    scoreText.textContent = `Your score: ${finalScore}`;
    scoreText.style.whiteSpace = "normal";
  }

  modal.classList.remove("hidden");
}

function hideGameOverModal() {
  const modal = document.getElementById("game-over-modal");
  modal.classList.add("hidden");
}

window.addEventListener("load", () => {
  const closeBtn = document.getElementById("close-modal-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      hideGameOverModal();
      restartGame();
    });
  }
});

function handleKeyPress(event) {
  const modal = document.getElementById("game-over-modal");
  const isModalVisible = !modal.classList.contains("hidden");

  switch (event.key) {
    case " ":
      event.preventDefault();
      if (isModalVisible) {
        hideGameOverModal();
        restartGame();
      } else {
        !gameRunning ? startGame() : togglePause();
      }
      return;

    case "r":
      event.preventDefault();
      hideGameOverModal();
      restartGame();
      return;

    case "t":
    case "T":
      event.preventDefault();
      toggleTheme();
      return;

    case "i":
    case "I":
      event.preventDefault();
      if (gameRunning) {
        // Disable lawnmower autopilot if it's active
        if (lawnmowerAutopilot.isActive()) {
          lawnmowerAutopilot.toggle();
        }
        
        // Choose appropriate autopilot based on border mode
        if (borderWrapMode) {
          // Disable normal autopilot if active
          if (autopilot.isActive()) {
            autopilot.toggle();
          }
          borderlessAutopilot.toggle();
        } else {
          // Disable borderless autopilot if active
          if (borderlessAutopilot.isActive()) {
            borderlessAutopilot.toggle();
          }
          autopilot.toggle();
        }
      }
      return;

    case "p":
    case "P":
      event.preventDefault();
      if (gameRunning) {
        // Disable smart autopilots if they're active
        if (autopilot.isActive()) {
          autopilot.toggle();
        }
        if (borderlessAutopilot.isActive()) {
          borderlessAutopilot.toggle();
        }
        lawnmowerAutopilot.toggle();
      }
      return;

    case ",":
      event.preventDefault();
      decreaseSpeed();
      return;

    case ".":
      event.preventDefault();
      increaseSpeed();
      return;

    case "n":
    case "N":
      event.preventDefault();
      if (window.audioManager) {
        audioManager.toggleSounds();
        audioManager.updateUIFromSettings();
      }
      return;

    case "m":
    case "M":
      event.preventDefault();
      if (window.audioManager) {
        audioManager.toggleMusic();
        audioManager.updateUIFromSettings();
      }
      return;

    case "b":
    case "B":
      event.preventDefault();
      toggleBorderMode();
      return;
  }

  if (gamePaused) return;
  if (!gameRunning) return;

  switch (event.key) {
    case "ArrowUp":
    case "w":
    case "W":
      if (direction !== DIRECTIONS.DOWN) nextDirection = DIRECTIONS.UP;
      break;
    case "ArrowDown":
    case "s":
    case "S":
      if (direction !== DIRECTIONS.UP) nextDirection = DIRECTIONS.DOWN;
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      if (direction !== DIRECTIONS.RIGHT) nextDirection = DIRECTIONS.LEFT;
      break;
    case "ArrowRight":
    case "d":
    case "D":
      if (direction !== DIRECTIONS.LEFT) nextDirection = DIRECTIONS.RIGHT;
      break;
  }
}

function init() {
  initializeGrid();

  startButton.addEventListener("click", startGame);
  pauseButton.addEventListener("click", togglePause);
  helpButton.addEventListener("click", toggleHelp);
  borderModeButton.addEventListener("click", toggleBorderMode);
  themeToggle.addEventListener("change", toggleTheme);
  document.addEventListener("keydown", handleKeyPress);

  autopilot.updateDisplay();
  borderlessAutopilot.updateDisplay();
  lawnmowerAutopilot.updateDisplay();

  loadThemePreference();
  loadBorderModePreference();
}

function loadThemePreference() {
  const savedTheme = localStorage.getItem("snakeTheme");

  isDarkMode = false;
  themeToggle.checked = false;

  if (savedTheme === "dark") {
    themeToggle.checked = true;
    toggleTheme();
  }
}

function loadBorderModePreference() {
  const savedBorderMode = localStorage.getItem("snakeBorderWrapMode");
  
  borderWrapMode = false;
  
  if (savedBorderMode === "true") {
    toggleBorderMode();
  } else {
    // Initialize button text for default state
    borderModeButton.textContent = "Borders";
    borderModeButton.title = "Border Wrap Mode OFF - Snake dies at edges";
  }
}

window.addEventListener("load", init);
