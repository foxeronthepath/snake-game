// Borderless Autopilot module for Snake Game - Optimized for wrap-around mode
class BorderlessSnakeAutopilot {
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
      console.log("🌀 Borderless autopilot activated! Using wrap-aware pathfinding...");
    } else {
      console.log("❌ Borderless autopilot deactivated!");
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
      autopilotStatus.textContent = this.active ? "BORDERLESS AUTOPILOT: ON" : "BORDERLESS AUTOPILOT: OFF";
      autopilotStatus.style.color = this.active ? "#ff6b35" : "#666";
    }
    
    // If status element doesn't exist, log to console instead
    if (!autopilotStatus && this.active) {
      console.log("Borderless Autopilot: ACTIVATED");
    }
  }

  // Main entry point for getting next direction using wrap-aware algorithms
  getNextDirection(snake, food, currentDirection, gridSize) {
    if (!this.active) {
      return null;
    }

    const head = snake[0];
    const body = new Set(snake.slice(1).map(seg => `${seg.x},${seg.y}`));
    
    // First, always check for immediate safety (wrap-aware)
    const safeDirection = this._getImmediateSafeDirection(head, body, currentDirection, gridSize);
    
    // Use wrap-aware A* pathfinding to find path to food
    const path = this._findPathAStarWrap(head, food, body, gridSize, 500);
    
    if (path && path.length > 1) {
      // Get next position in path
      const nextPos = path[1];
      const direction = this._getDirectionToPositionWrap(head, nextPos, gridSize);
      
      // Verify this direction is safe and not a 180-degree turn
      if (direction && 
          this._isDirectionSafeWrap(head, body, direction, gridSize) && 
          this._isValidDirectionChange(currentDirection, direction)) {
        return direction;
      }
    }
    
    // If A* failed, try simple wrap-aware pathfinding
    const simpleDirection = this._simpleChaseFoodWrap(head, body, food, currentDirection, gridSize);
    if (simpleDirection && 
        this._isDirectionSafeWrap(head, body, simpleDirection, gridSize) && 
        this._isValidDirectionChange(currentDirection, simpleDirection)) {
      return simpleDirection;
    }
    
    // If all else fails, return the safe direction
    return safeDirection;
  }

  // Wrap-aware A* pathfinding algorithm
  _findPathAStarWrap(start, goal, obstacles, gridSize, maxIterations = 1000) {
    // Wrap-aware Manhattan distance heuristic
    const heuristic = (pos) => {
      const dx = Math.min(
        Math.abs(pos.x - goal.x),
        Math.abs(pos.x - goal.x + gridSize),
        Math.abs(pos.x - goal.x - gridSize)
      );
      const dy = Math.min(
        Math.abs(pos.y - goal.y),
        Math.abs(pos.y - goal.y + gridSize),
        Math.abs(pos.y - goal.y - gridSize)
      );
      return dx + dy;
    };

    // Get valid neighboring positions (wrap-aware)
    const getNeighbors = (pos) => {
      const neighbors = [];
      const moves = [
        { x: 0, y: 1 },   // DOWN
        { x: 0, y: -1 },  // UP
        { x: 1, y: 0 },   // RIGHT
        { x: -1, y: 0 }   // LEFT
      ];
      
      for (const move of moves) {
        let newPos = { x: pos.x + move.x, y: pos.y + move.y };
        
        // Handle wrapping
        newPos = this._wrapPosition(newPos, gridSize);
        
        const posKey = `${newPos.x},${newPos.y}`;
        
        if (!obstacles.has(posKey)) {
          neighbors.push(newPos);
        }
      }
      return neighbors;
    };

    // Priority queue implementation
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

  // Wrap position within grid bounds
  _wrapPosition(pos, gridSize) {
    return {
      x: ((pos.x % gridSize) + gridSize) % gridSize,
      y: ((pos.y % gridSize) + gridSize) % gridSize
    };
  }

  // Get direction needed to move from one position to another (wrap-aware)
  _getDirectionToPositionWrap(fromPos, toPos, gridSize) {
    // Calculate direct differences
    const directDx = toPos.x - fromPos.x;
    const directDy = toPos.y - fromPos.y;
    
    // Calculate wrapped differences
    const wrapDx = directDx > 0 ? directDx - gridSize : directDx + gridSize;
    const wrapDy = directDy > 0 ? directDy - gridSize : directDy + gridSize;
    
    // Choose the shorter path
    const dx = Math.abs(directDx) <= Math.abs(wrapDx) ? directDx : wrapDx;
    const dy = Math.abs(directDy) <= Math.abs(wrapDy) ? directDy : wrapDy;
    
    // Return direction based on shortest path
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? this.directions.RIGHT : this.directions.LEFT;
    } else if (dy !== 0) {
      return dy > 0 ? this.directions.DOWN : this.directions.UP;
    }
    
    return null;
  }

  // Get any immediately safe direction (wrap-aware)
  _getImmediateSafeDirection(head, body, currentDirection, gridSize) {
    const directions = [
      { dir: this.directions.UP, delta: { x: 0, y: -1 } },
      { dir: this.directions.DOWN, delta: { x: 0, y: 1 } },
      { dir: this.directions.LEFT, delta: { x: -1, y: 0 } },
      { dir: this.directions.RIGHT, delta: { x: 1, y: 0 } }
    ];
    
    // First try current direction (keep going forward)
    const currentDelta = this.directionValues[currentDirection];
    let newPos = { x: head.x + currentDelta.x, y: head.y + currentDelta.y };
    newPos = this._wrapPosition(newPos, gridSize);
    
    if (!body.has(`${newPos.x},${newPos.y}`)) {
      return currentDirection;
    }
    
    // Then try other valid directions (not 180-degree turns)
    for (const dirObj of directions) {
      if (this._isValidDirectionChange(currentDirection, dirObj.dir)) {
        let testPos = { x: head.x + dirObj.delta.x, y: head.y + dirObj.delta.y };
        testPos = this._wrapPosition(testPos, gridSize);
        
        if (!body.has(`${testPos.x},${testPos.y}`)) {
          return dirObj.dir;
        }
      }
    }
    
    // Last resort: any safe direction
    for (const dirObj of directions) {
      let testPos = { x: head.x + dirObj.delta.x, y: head.y + dirObj.delta.y };
      testPos = this._wrapPosition(testPos, gridSize);
      
      if (!body.has(`${testPos.x},${testPos.y}`)) {
        return dirObj.dir;
      }
    }
    
    return null;
  }

  // Check if a direction is safe to move (wrap-aware)
  _isDirectionSafeWrap(head, body, direction, gridSize) {
    const delta = this.directionValues[direction];
    let newPos = { x: head.x + delta.x, y: head.y + delta.y };
    newPos = this._wrapPosition(newPos, gridSize);
    
    return !body.has(`${newPos.x},${newPos.y}`);
  }

  // Simple wrap-aware pathfinding towards food
  _simpleChaseFoodWrap(head, body, food, currentDirection, gridSize) {
    // Calculate both direct and wrapped distances
    const directDx = food.x - head.x;
    const directDy = food.y - head.y;
    
    const wrapDx = directDx > 0 ? directDx - gridSize : directDx + gridSize;
    const wrapDy = directDy > 0 ? directDy - gridSize : directDy + gridSize;
    
    // Choose shorter paths
    const dx = Math.abs(directDx) <= Math.abs(wrapDx) ? directDx : wrapDx;
    const dy = Math.abs(directDy) <= Math.abs(wrapDy) ? directDy : wrapDy;
    
    // Create preference list based on shortest distances
    const preferredDirections = [];
    
    // Add horizontal movement
    if (Math.abs(dx) > 0) {
      if (dx > 0) {
        preferredDirections.push(this.directions.RIGHT);
      } else {
        preferredDirections.push(this.directions.LEFT);
      }
    }
    
    // Add vertical movement
    if (Math.abs(dy) > 0) {
      if (dy > 0) {
        preferredDirections.push(this.directions.DOWN);
      } else {
        preferredDirections.push(this.directions.UP);
      }
    }
    
    // Try each direction, but avoid 180-degree turns
    for (const direction of preferredDirections) {
      if (this._isDirectionSafeWrap(head, body, direction, gridSize) && 
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

  // Calculate wrap-aware distance between two points
  _getWrapDistance(pos1, pos2, gridSize) {
    const dx = Math.min(
      Math.abs(pos1.x - pos2.x),
      Math.abs(pos1.x - pos2.x + gridSize),
      Math.abs(pos1.x - pos2.x - gridSize)
    );
    const dy = Math.min(
      Math.abs(pos1.y - pos2.y),
      Math.abs(pos1.y - pos2.y + gridSize),
      Math.abs(pos1.y - pos2.y - gridSize)
    );
    return dx + dy;
  }

  // Find a survival move that maximizes available space (wrap-aware)
  _findSafeSurvivalMoveWrap(head, body, food, gridSize) {
    // Calculate reachable space from a position (wrap-aware)
    const calculateSpaceScore = (pos) => {
      const visited = new Set();
      const queue = [pos];
      let spaceCount = 0;
      
      while (queue.length > 0 && spaceCount < 50) {
        const current = queue.shift();
        const currentKey = `${current.x},${current.y}`;
        
        if (visited.has(currentKey)) {
          continue;
        }
        
        visited.add(currentKey);
        spaceCount++;
        
        // Add valid neighbors to queue (wrap-aware)
        const neighbors = [
          { x: current.x, y: current.y + 1 },
          { x: current.x, y: current.y - 1 },
          { x: current.x + 1, y: current.y },
          { x: current.x - 1, y: current.y }
        ];
        
        for (let next of neighbors) {
          next = this._wrapPosition(next, gridSize);
          const nextKey = `${next.x},${next.y}`;
          
          if (!body.has(nextKey) && !visited.has(nextKey)) {
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
      let newPos = { x: head.x + dirObj.delta.x, y: head.y + dirObj.delta.y };
      newPos = this._wrapPosition(newPos, gridSize);
      
      // Check if move is valid
      if (!body.has(`${newPos.x},${newPos.y}`)) {
        // Calculate score for this move
        const spaceScore = calculateSpaceScore(newPos);
        
        // Bonus for being closer to food (wrap-aware distance)
        const foodDistance = this._getWrapDistance(newPos, food, gridSize);
        const foodBonus = Math.max(0, 30 - foodDistance);
        
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

// Create global borderless autopilot instance
const borderlessAutopilot = new BorderlessSnakeAutopilot();

// Make it available globally
window.borderlessAutopilot = borderlessAutopilot;
