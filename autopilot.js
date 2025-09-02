// Autopilot module for Snake Game
class SnakeAutopilot {
  constructor() {
    this.enabled = false;
    this.directions = {
      UP: "up",
      DOWN: "down", 
      LEFT: "left",
      RIGHT: "right"
    };
  }

  // Toggle autopilot on/off
  toggle() {
    this.enabled = !this.enabled;
    this.updateDisplay();
    return this.enabled;
  }

  // Check if autopilot is enabled
  isEnabled() {
    return this.enabled;
  }

  // Reset autopilot state
  reset() {
    this.enabled = false;
    this.updateDisplay();
  }

  // Update the UI display
  updateDisplay() {
    const autopilotStatus = document.getElementById("autopilot-status");
    if (autopilotStatus) {
      autopilotStatus.textContent = this.enabled ? "AUTOPILOT: ON" : "AUTOPILOT: OFF";
      autopilotStatus.style.color = this.enabled ? "#00c206" : "#666";
    }
  }

  // Check if a position is safe (no collision with walls or snake body)
  isPositionSafe(x, y, snake, gridSize) {
    // Check if position is within bounds
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
      return false;
    }

    // Check if position collides with snake body
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === x && snake[i].y === y) {
        return false;
      }
    }

    return true;
  }

  // Calculate Manhattan distance between two positions
  getDistance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  // Get the opposite direction
  getOppositeDirection(dir) {
    switch (dir) {
      case this.directions.UP: return this.directions.DOWN;
      case this.directions.DOWN: return this.directions.UP;
      case this.directions.LEFT: return this.directions.RIGHT;
      case this.directions.RIGHT: return this.directions.LEFT;
      default: return dir;
    }
  }

  // Calculate the best next direction for the snake
  getNextDirection(snake, food, currentDirection, gridSize) {
    const head = snake[0];
    const possibleMoves = [
      { direction: this.directions.UP, x: head.x, y: head.y - 1 },
      { direction: this.directions.DOWN, x: head.x, y: head.y + 1 },
      { direction: this.directions.LEFT, x: head.x - 1, y: head.y },
      { direction: this.directions.RIGHT, x: head.x + 1, y: head.y }
    ];

    // Filter out moves that would cause immediate collision
    const safeMoves = possibleMoves.filter(move => 
      this.isPositionSafe(move.x, move.y, snake, gridSize) && 
      move.direction !== this.getOppositeDirection(currentDirection)
    );

    if (safeMoves.length === 0) {
      // If no safe moves, try to avoid collision by going in current direction
      return currentDirection;
    }

    // Find the move that gets closest to food
    let bestMove = safeMoves[0];
    let bestDistance = this.getDistance({ x: bestMove.x, y: bestMove.y }, food);

    for (let i = 1; i < safeMoves.length; i++) {
      const distance = this.getDistance({ x: safeMoves[i].x, y: safeMoves[i].y }, food);
      if (distance < bestDistance) {
        bestMove = safeMoves[i];
        bestDistance = distance;
      }
    }

    return bestMove.direction;
  }
}

// Create global autopilot instance
const autopilot = new SnakeAutopilot();
