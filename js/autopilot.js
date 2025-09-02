// Smart Autopilot module for Snake Game - Based on Python A* implementation
class SmartSnakeAutopilot {
  constructor() {
    this.active = false;
    this.directions = {
      UP: "up",
      DOWN: "down", 
      LEFT: "left",
      RIGHT: "right"
    };
    this.directionValues = {
      [this.directions.UP]: { x: 0, y: -1 },
      [this.directions.DOWN]: { x: 0, y: 1 },
      [this.directions.LEFT]: { x: -1, y: 0 },
      [this.directions.RIGHT]: { x: 1, y: 0 }
    };
  }

  // Toggle autopilot on/off
  toggle() {
    this.active = !this.active;
    this.updateDisplay();
    if (this.active) {
      console.log("Smart autopilot activated! Using A* pathfinding...");
    } else {
      console.log("Smart autopilot deactivated!");
    }
    return this.active;
  }

  // Check if autopilot is active
  isActive() {
    return this.active;
  }

  // Legacy method for compatibility
  isEnabled() {
    return this.active;
  }

  // Reset autopilot state
  reset() {
    this.active = false;
    this.updateDisplay();
  }

  // Update the UI display
  updateDisplay() {
    const autopilotStatus = document.getElementById("autopilot-status");
    if (autopilotStatus) {
      autopilotStatus.textContent = this.active ? "SMART AUTOPILOT: ON" : "SMART AUTOPILOT: OFF";
      autopilotStatus.style.color = this.active ? "#00c206" : "#666";
    }
  }

  // Main entry point for getting next direction using smart algorithms
  getNextDirection(snake, food, currentDirection, gridSize) {
    if (!this.active) {
      return null;
    }

    const head = snake[0];
    const body = new Set(snake.slice(1).map(seg => `${seg.x},${seg.y}`));
    
    // First, always check for immediate safety
    const safeDirection = this._getImmediateSafeDirection(head, body, currentDirection, gridSize);
    
    // Use A* pathfinding to find path to food (with timeout protection)
    const path = this._findPathAStar(head, food, body, gridSize, 500);
    
    if (path && path.length > 1) {
      // Get next position in path
      const nextPos = path[1];
      const direction = this._getDirectionToPosition(head, nextPos);
      
      // Verify this direction is safe and not a 180-degree turn
      if (direction && 
          this._isDirectionSafe(head, body, direction, gridSize) && 
          this._isValidDirectionChange(currentDirection, direction)) {
        return direction;
      }
    }
    
    // If A* failed or gave unsafe direction, try simple pathfinding
    const simpleDirection = this._simpleChaseFood(head, body, food, currentDirection, gridSize);
    if (simpleDirection && 
        this._isDirectionSafe(head, body, simpleDirection, gridSize) && 
        this._isValidDirectionChange(currentDirection, simpleDirection)) {
      return simpleDirection;
    }
    
    // If all else fails, return the safe direction (even if not towards food)
    return safeDirection;
  }

  // A* pathfinding algorithm to find optimal path to food
  _findPathAStar(start, goal, obstacles, gridSize, maxIterations = 1000) {
    // Manhattan distance heuristic
    const heuristic = (pos) => {
      return Math.abs(pos.x - goal.x) + Math.abs(pos.y - goal.y);
    };

    // Get valid neighboring positions
    const getNeighbors = (pos) => {
      const neighbors = [];
      const moves = [
        { x: 0, y: 1 },   // DOWN
        { x: 0, y: -1 },  // UP
        { x: 1, y: 0 },   // RIGHT
        { x: -1, y: 0 }   // LEFT
      ];
      
      for (const move of moves) {
        const newPos = { x: pos.x + move.x, y: pos.y + move.y };
        const posKey = `${newPos.x},${newPos.y}`;
        
        if (newPos.x >= 0 && newPos.x < gridSize && 
            newPos.y >= 0 && newPos.y < gridSize && 
            !obstacles.has(posKey)) {
          neighbors.push(newPos);
        }
      }
      return neighbors;
    };

    // Priority queue implemented as array (not optimal but simple)
    // Each item: { fScore, gScore, uniqueId, position, path }
    const openSet = [{ 
      fScore: heuristic(start), 
      gScore: 0, 
      uniqueId: 0, 
      position: start, 
      path: [start] 
    }];
    
    const closedSet = new Set();
    let uniqueCounter = 1;
    let iterations = 0;

    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;
      
      // Find item with lowest fScore
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].fScore < openSet[currentIndex].fScore) {
          currentIndex = i;
        }
      }

      const current = openSet.splice(currentIndex, 1)[0];
      const currentKey = `${current.position.x},${current.position.y}`;
      
      if (closedSet.has(currentKey)) {
        continue;
      }
      
      closedSet.add(currentKey);

      // Check if we reached the goal
      if (current.position.x === goal.x && current.position.y === goal.y) {
        return current.path;
      }
      
      // Explore neighbors
      const neighbors = getNeighbors(current.position);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (closedSet.has(neighborKey)) {
          continue;
        }

        const newGScore = current.gScore + 1;
        const newFScore = newGScore + heuristic(neighbor);
        const newPath = [...current.path, neighbor];
        
        openSet.push({
          fScore: newFScore,
          gScore: newGScore,
          uniqueId: uniqueCounter++,
          position: neighbor,
          path: newPath
        });
      }
    }

    return null; // No path found
  }

  // Get direction needed to move from one position to another
  _getDirectionToPosition(fromPos, toPos) {
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    
    if (dx === 1 && dy === 0) {
      return this.directions.RIGHT;
    } else if (dx === -1 && dy === 0) {
      return this.directions.LEFT;
    } else if (dx === 0 && dy === 1) {
      return this.directions.DOWN;
    } else if (dx === 0 && dy === -1) {
      return this.directions.UP;
    }
    
    return null;
  }

  // Get any immediately safe direction to avoid death, preferring forward movement
  _getImmediateSafeDirection(head, body, currentDirection, gridSize) {
    const directions = [
      { dir: this.directions.UP, delta: { x: 0, y: -1 } },
      { dir: this.directions.DOWN, delta: { x: 0, y: 1 } },
      { dir: this.directions.LEFT, delta: { x: -1, y: 0 } },
      { dir: this.directions.RIGHT, delta: { x: 1, y: 0 } }
    ];
    
    // First try current direction (keep going forward)
    const currentDelta = this.directionValues[currentDirection];
    const newPos = { x: head.x + currentDelta.x, y: head.y + currentDelta.y };
    const boundsCheck = (newPos.x >= 0 && newPos.x < gridSize && newPos.y >= 0 && newPos.y < gridSize);
    const bodyCheck = !body.has(`${newPos.x},${newPos.y}`);
    
    if (boundsCheck && bodyCheck) {
      return currentDirection;
    }
    
    // Then try other valid directions (not 180-degree turns)
    for (const dirObj of directions) {
      if (this._isValidDirectionChange(currentDirection, dirObj.dir)) {
        const newPos = { x: head.x + dirObj.delta.x, y: head.y + dirObj.delta.y };
        const boundsCheck = (newPos.x >= 0 && newPos.x < gridSize && newPos.y >= 0 && newPos.y < gridSize);
        const bodyCheck = !body.has(`${newPos.x},${newPos.y}`);
        
        if (boundsCheck && bodyCheck) {
          return dirObj.dir;
        }
      }
    }
    
    // Last resort: any safe direction
    for (const dirObj of directions) {
      const newPos = { x: head.x + dirObj.delta.x, y: head.y + dirObj.delta.y };
      const boundsCheck = (newPos.x >= 0 && newPos.x < gridSize && newPos.y >= 0 && newPos.y < gridSize);
      const bodyCheck = !body.has(`${newPos.x},${newPos.y}`);
      
      if (boundsCheck && bodyCheck) {
        return dirObj.dir;
      }
    }
    
    return null;
  }

  // Check if a direction is safe to move
  _isDirectionSafe(head, body, direction, gridSize) {
    const delta = this.directionValues[direction];
    const newPos = { x: head.x + delta.x, y: head.y + delta.y };
    
    const boundsCheck = (newPos.x >= 0 && newPos.x < gridSize && newPos.y >= 0 && newPos.y < gridSize);
    const bodyCheck = !body.has(`${newPos.x},${newPos.y}`);
    
    return boundsCheck && bodyCheck;
  }

  // Simple pathfinding towards food (fallback method)
  _simpleChaseFood(head, body, food, currentDirection, gridSize) {
    const dx = food.x - head.x;
    const dy = food.y - head.y;
    
    // Create a list of possible directions in order of preference
    const preferredDirections = [];
    
    // Add horizontal movement
    if (dx > 0) {  // Food is to the right
      preferredDirections.push(this.directions.RIGHT);
    } else if (dx < 0) {  // Food is to the left
      preferredDirections.push(this.directions.LEFT);
    }
    
    // Add vertical movement
    if (dy > 0) {  // Food is below
      preferredDirections.push(this.directions.DOWN);
    } else if (dy < 0) {  // Food is above
      preferredDirections.push(this.directions.UP);
    }
    
    // Try each direction, but avoid 180-degree turns
    for (const direction of preferredDirections) {
      if (this._isDirectionSafe(head, body, direction, gridSize) && 
          this._isValidDirectionChange(currentDirection, direction)) {
        return direction;
      }
    }
    
    return null;
  }

  // Check if direction change is valid (no 180-degree turns)
  _isValidDirectionChange(currentDirection, newDirection) {
    const opposites = {
      [this.directions.UP]: this.directions.DOWN,
      [this.directions.DOWN]: this.directions.UP,
      [this.directions.LEFT]: this.directions.RIGHT,
      [this.directions.RIGHT]: this.directions.LEFT
    };
    
    return opposites[currentDirection] !== newDirection;
  }

  // Find a move that keeps the snake alive when no direct path to food exists
  _findSafeSurvivalMove(head, body, food, gridSize) {
    // Calculate how much space is reachable from a position
    const calculateSpaceScore = (pos) => {
      const visited = new Set();
      const queue = [pos];
      let spaceCount = 0;
      
      while (queue.length > 0 && spaceCount < 50) {  // Limit search
        const current = queue.shift();
        const currentKey = `${current.x},${current.y}`;
        
        if (visited.has(currentKey)) {
          continue;
        }
        
        visited.add(currentKey);
        spaceCount++;
        
        // Add valid neighbors to queue
        const neighbors = [
          { x: current.x, y: current.y + 1 },
          { x: current.x, y: current.y - 1 },
          { x: current.x + 1, y: current.y },
          { x: current.x - 1, y: current.y }
        ];
        
        for (const next of neighbors) {
          const nextKey = `${next.x},${next.y}`;
          if (next.x >= 0 && next.x < gridSize && 
              next.y >= 0 && next.y < gridSize && 
              !body.has(nextKey) && 
              !visited.has(nextKey)) {
            queue.push(next);
          }
        }
      }
      
      return spaceCount;
    };
    
    // Evaluate all possible moves
    let bestDirection = null;
    let bestScore = -1;
    
    const directions = [
      { dir: this.directions.UP, delta: { x: 0, y: -1 } },
      { dir: this.directions.DOWN, delta: { x: 0, y: 1 } },
      { dir: this.directions.LEFT, delta: { x: -1, y: 0 } },
      { dir: this.directions.RIGHT, delta: { x: 1, y: 0 } }
    ];
    
    for (const dirObj of directions) {
      const newPos = { x: head.x + dirObj.delta.x, y: head.y + dirObj.delta.y };
      
      // Check if move is valid
      if (newPos.x >= 0 && newPos.x < gridSize && 
          newPos.y >= 0 && newPos.y < gridSize && 
          !body.has(`${newPos.x},${newPos.y}`)) {
        
        // Calculate score for this move
        const spaceScore = calculateSpaceScore(newPos);
        
        // Bonus for moving towards food (but not too heavily weighted)
        const foodDistance = Math.abs(newPos.x - food.x) + Math.abs(newPos.y - food.y);
        const foodBonus = Math.max(0, 50 - foodDistance);  // Small bonus for being closer to food
        
        const totalScore = spaceScore + foodBonus;
        
        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestDirection = dirObj.dir;
        }
      }
    }
    
    return bestDirection;
  }
}

// Create global autopilot instance
const autopilot = new SmartSnakeAutopilot();