const GRID_SIZE = 20;
const CELL_SIZE = 20;
const GAME_SPEED = 150; //milliseconds

let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let direction = "right";
let nextDirection = "right";
let score = 0;
let gameInterval;
let gameRunning = false;

const gridElement = document.getElementById("grid");
const scoreElement = document.getElementById("score");
const startButton = document.getElementById("start-btn");

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
  document.querySelectorAll(".snake, .food").forEach((element) => {
    element.classList.remove("snake", "food");
  });

  snake.forEach((segment) => {
    const cell = document.getElementById(`cell-${segment.x}-${segment.y}`);
    if (cell) cell.classList.add("snake");
  });

  const foodCell = document.getElementById(`cell-${food.x}-${food.y}`);
  if (foodCell) foodCell.classList.add("food");

  scoreElement.textContent = score;
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
  direction = nextDirection;

  const head = { ...snake[0] };
  switch (direction) {
    case "up":
      head.y--;
      break;
    case "down":
      head.y++;
      break;
    case "left":
      head.x--;
      break;
    case "right":
      head.x++;
      break;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    generateFood();
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

function startGame() {
  if (gameRunning) return;

  snake = [{ x: 10, y: 10 }];
  direction = "right";
  nextDirection = "right";
  score = 0;
  generateFood();

  gameRunning = true;
  startButton.textContent = "Restart Game";

  gameInterval = setInterval(gameLoop, GAME_SPEED);

  updateDisplay();
}

function endGame() {
  clearInterval(gameInterval);
  gameRunning = false;
  alert(`Game Over! Your score: ${score}`);
  startButton.textContent = "Start Game";
}

function handleKeyPress(event) {
  switch (event.key) {
    case "ArrowUp":
      if (direction !== "down") nextDirection = "up";
      break;
    case "ArrowDown":
      if (direction !== "up") nextDirection = "down";
      break;
    case "ArrowLeft":
      if (direction !== "right") nextDirection = "left";
      break;
    case "ArrowRight":
      if (direction !== "left") nextDirection = "right";
      break;
  }
}

function init() {
  initializeGrid();
  startButton.addEventListener("click", startGame);
  document.addEventListener("keydown", handleKeyPress);
}

window.addEventListener("load", init);
