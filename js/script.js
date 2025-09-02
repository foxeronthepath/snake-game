const GRID_SIZE = 20;
const CELL_SIZE = 20;
let score = 0;
const GAME_SPEED = 150; // milliseconds (default speed)
const MIN_SPEED = 5;   // fastest speed (lower number = faster)
const MAX_SPEED = 300;  // slowest speed (higher number = slower)
const SPEED_STEP = 5;  // speed change increment
let currentSpeed = GAME_SPEED;
const INITIAL_POSITION = { x: 10, y: 10 };
const DIRECTIONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
};

let snake = [{ ...INITIAL_POSITION }];
let food = { x: 5, y: 5 };
let direction = DIRECTIONS.RIGHT;
let nextDirection = DIRECTIONS.RIGHT;
let gameInterval;
let gameRunning = false;
let gamePaused = false;
let isDarkMode = false;

const gridElement = document.getElementById("grid");
const scoreElement = document.getElementById("score");
const startButton = document.getElementById("start-btn");
const pauseButton = document.getElementById("pause-btn");
const themeToggle = document.getElementById("theme-switch-checkbox");

function toggleTheme() {
  isDarkMode = !isDarkMode;

  const theme = isDarkMode ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.checked = isDarkMode;

  localStorage.setItem("snakeTheme", theme);
}

function increaseSpeed() {
  if (currentSpeed > MIN_SPEED) {
    currentSpeed -= SPEED_STEP;
    if (currentSpeed < MIN_SPEED) currentSpeed = MIN_SPEED;
    updateGameSpeed();
    console.log(`Speed increased! Current speed: ${currentSpeed}ms`);
  }
}

function decreaseSpeed() {
  if (currentSpeed < MAX_SPEED) {
    currentSpeed += SPEED_STEP;
    if (currentSpeed > MAX_SPEED) currentSpeed = MAX_SPEED;
    updateGameSpeed();
    console.log(`Speed decreased! Current speed: ${currentSpeed}ms`);
  }
}

function updateGameSpeed() {
  if (gameRunning && !gamePaused) {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, currentSpeed);
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
}

function generateFood() {
  let newFood;

  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (
    snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
  );

  food = newFood;
}

function updateDisplay() {
  clearGameElements();

  drawSnakeBody();

  if (snake.length > 0) {
    drawSnakeHead();
  }

  drawFood();

  scoreElement.textContent = score;
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

  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    return true;
  }

  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      return true;
    }
  }

  return false;
}

function moveSnake() {
  // Use autopilot if enabled (check both types)
  if (autopilot.isEnabled()) {
    const autopilotDirection = autopilot.getNextDirection(snake, food, direction, GRID_SIZE);
    if (autopilotDirection) {
      nextDirection = autopilotDirection;
    }
  } else if (lawnmowerAutopilot.isEnabled()) {
    const lawnmowerDirection = lawnmowerAutopilot.getNextDirection(snake, food, direction, GRID_SIZE);
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

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    generateFood();
    
    // Check for winning condition: snake covers all grid except 1 cell (for food)
    if (snake.length === GRID_SIZE * GRID_SIZE - 1) {
      endGame(true); // Pass true to indicate winning
      return;
    }
  } else {
    snake.pop();
  }

  if (checkCollision()) {
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
  currentSpeed = GAME_SPEED; // Reset speed to default
  gameRunning = true;
  gamePaused = false;

  generateFood();

  startButton.textContent = "Restart Game";
  pauseButton.textContent = "Pause";
  pauseButton.classList.remove("hidden");

  // Reset both autopilots when starting new game
  autopilot.reset();
  lawnmowerAutopilot.reset();

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
}

function resumeGame() {
  if (!gameRunning || !gamePaused) return;

  gameInterval = setInterval(gameLoop, currentSpeed);
  gamePaused = false;
  pauseButton.textContent = "Pause";
}

function endGame(isWin = false) {
  clearInterval(gameInterval);

  gameRunning = false;
  gamePaused = false;

  pauseButton.classList.add("hidden");
  pauseButton.textContent = "Pause";
  startButton.textContent = "Start Game";

  // Reset both autopilots when game ends
  autopilot.reset();
  lawnmowerAutopilot.reset();

  showGameOverModal(score, isWin);
}

function showGameOverModal(finalScore, isWin = false) {
  const modal = document.getElementById("game-over-modal");
  const modalTitle = modal.querySelector("h2");
  const scoreText = document.getElementById("final-score");
  
  if (isWin) {
    modalTitle.textContent = "🎉 YOU WIN! 🎉";
    scoreText.textContent = `Congratulations! You covered the entire grid!\nFinal score: ${finalScore}`;
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
      
    case "a":
    case "A":
      event.preventDefault();
      if (gameRunning) {
        // Disable lawnmower autopilot if it's active
        if (lawnmowerAutopilot.isActive()) {
          lawnmowerAutopilot.toggle();
        }
        autopilot.toggle();
      }
      return;
      
    case "p":
    case "P":
      event.preventDefault();
      if (gameRunning) {
        // Disable smart autopilot if it's active
        if (autopilot.isActive()) {
          autopilot.toggle();
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
  }

  if (gamePaused) return;
  if (!gameRunning) return;


  switch (event.key) {
    case "ArrowUp":
      if (direction !== DIRECTIONS.DOWN) nextDirection = DIRECTIONS.UP;
      break;
    case "ArrowDown":
      if (direction !== DIRECTIONS.UP) nextDirection = DIRECTIONS.DOWN;
      break;
    case "ArrowLeft":
      if (direction !== DIRECTIONS.RIGHT) nextDirection = DIRECTIONS.LEFT;
      break;
    case "ArrowRight":
      if (direction !== DIRECTIONS.LEFT) nextDirection = DIRECTIONS.RIGHT;
      break;
  }
}

function init() {
  initializeGrid();

  startButton.addEventListener("click", startGame);
  pauseButton.addEventListener("click", togglePause);
  themeToggle.addEventListener("change", toggleTheme);
  document.addEventListener("keydown", handleKeyPress);

  // Initialize both autopilot displays
  autopilot.updateDisplay();
  lawnmowerAutopilot.updateDisplay();

  loadThemePreference();
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

window.addEventListener("load", init);
