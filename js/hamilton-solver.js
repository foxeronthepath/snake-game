// Hamilton Solver autopilot - follows a Hamiltonian cycle with safe shortcuts to food
class HamiltonSolver {
  constructor() {
    this.active = false;
    this.cycle = [];
    this.indexGrid = [];
    this.gridSize = 0;
    this.directions = {
      UP: "up",
      DOWN: "down",
      LEFT: "left",
      RIGHT: "right",
    };
    this.directionValues = {
      [this.directions.UP]: { x: 0, y: -1 },
      [this.directions.DOWN]: { x: 0, y: 1 },
      [this.directions.LEFT]: { x: -1, y: 0 },
      [this.directions.RIGHT]: { x: 1, y: 0 },
    };
    // Above this fill ratio, shortcuts are disabled and only the next cycle step is used
    this.endgameFillRatio = 0.75;
  }

  toggle() {
    this.active = !this.active;
    this.updateDisplay();
    if (this.active) {
      console.log("🔄 Hamilton Solver activated! Using Hamiltonian cycle with shortcuts...");
    } else {
      console.log("❌ Hamilton Solver deactivated!");
    }
    return this.active;
  }

  isActive() {
    return this.active;
  }

  isEnabled() {
    return this.active;
  }

  reset() {
    this.active = false;
    this.cycle = [];
    this.indexGrid = [];
    this.gridSize = 0;
    this.updateDisplay();
  }

  updateDisplay() {
    const status = document.getElementById("autopilot-status");
    if (status) {
      status.textContent = this.active ? "HAMILTON SOLVER: ON" : "HAMILTON SOLVER: OFF";
      status.style.color = this.active ? "#9b59b6" : "#666";
    }
    if (!status && this.active) {
      console.log("Hamilton Solver: ACTIVATED");
    }
  }

  ensureCycle(gridSize, snake, currentDirection) {
    if (this.gridSize === gridSize && this.cycle.length === gridSize * gridSize) {
      return;
    }

    this.gridSize = gridSize;
    const built =
      snake.length >= 3
        ? this._buildCycleFromSnake(snake, currentDirection, gridSize)
        : null;

    if (built) {
      this.cycle = built.path;
      this.indexGrid = built.indexGrid;
    } else {
      const even = this._buildEvenGridCycle(gridSize, gridSize);
      this.cycle = even.path;
      this.indexGrid = even.indexGrid;
    }
  }

  getNextDirection(snake, food, currentDirection, gridSize) {
    if (!this.active) {
      return null;
    }

    this.ensureCycle(gridSize, snake, currentDirection);

    const head = snake[0];
    const tail = snake[snake.length - 1];
    const body = new Set(snake.slice(1).map((seg) => `${seg.x},${seg.y}`));
    const n = this.cycle.length;

    const headIdx = this._getIndex(head);
    const tailIdx = this._getIndex(tail);
    const foodIdx = this._getIndex(food);

    if (this._isEndgame(snake.length, n)) {
      return this._followCycle(head, body, headIdx, currentDirection, gridSize);
    }

    if (headIdx < 0 || tailIdx < 0 || foodIdx < 0) {
      return this._followCycle(head, body, headIdx, currentDirection, gridSize);
    }

    const candidates = this._getValidMoves(
      head,
      body,
      headIdx,
      tailIdx,
      foodIdx,
      currentDirection,
      gridSize,
      n
    );

    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        if (a.foodDist !== b.foodDist) return a.foodDist - b.foodDist;
        return (b.isCycleStep ? 1 : 0) - (a.isCycleStep ? 1 : 0);
      });
      return candidates[0].direction;
    }

    return this._followCycle(head, body, headIdx, currentDirection, gridSize);
  }

  _isEndgame(snakeLength, gridCells) {
    return snakeLength >= gridCells * this.endgameFillRatio;
  }

  _getIndex(pos) {
    if (
      pos.y < 0 ||
      pos.y >= this.indexGrid.length ||
      pos.x < 0 ||
      pos.x >= this.indexGrid[pos.y].length
    ) {
      return -1;
    }
    return this.indexGrid[pos.y][pos.x];
  }

  _posKey(pos) {
    return `${pos.x},${pos.y}`;
  }

  _forwardDistance(fromIdx, toIdx, n) {
    if (fromIdx < 0 || toIdx < 0) {
      return n;
    }
    return (toIdx - fromIdx + n) % n;
  }

  _isBetweenOnCycle(tailIdx, headIdx, targetIdx, n) {
    if (targetIdx < 0) {
      return true;
    }
    if (tailIdx === headIdx) {
      return targetIdx === tailIdx;
    }
    const distTailToHead = this._forwardDistance(tailIdx, headIdx, n);
    const distTailToTarget = this._forwardDistance(tailIdx, targetIdx, n);
    return distTailToTarget > 0 && distTailToTarget < distTailToHead;
  }

  _getDirectionToPosition(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (dx === 1) return this.directions.RIGHT;
    if (dx === -1) return this.directions.LEFT;
    if (dy === 1) return this.directions.DOWN;
    if (dy === -1) return this.directions.UP;
    return null;
  }

  _isValidDirectionChange(currentDirection, newDirection) {
    if (!currentDirection || !newDirection) return true;
    const opposites = {
      [this.directions.UP]: this.directions.DOWN,
      [this.directions.DOWN]: this.directions.UP,
      [this.directions.LEFT]: this.directions.RIGHT,
      [this.directions.RIGHT]: this.directions.LEFT,
    };
    return opposites[currentDirection] !== newDirection;
  }

  _isPositionSafe(pos, body, gridSize) {
    if (pos.x < 0 || pos.x >= gridSize || pos.y < 0 || pos.y >= gridSize) {
      return false;
    }
    return !body.has(this._posKey(pos));
  }

  _getValidMoves(head, body, headIdx, tailIdx, foodIdx, currentDirection, gridSize, n) {
    const moves = [];
    const nextCyclePos =
      headIdx >= 0 ? this.cycle[(headIdx + 1) % n] : null;
    const nextCycleDir =
      nextCyclePos && this._isPositionSafe(nextCyclePos, body, gridSize)
        ? this._getDirectionToPosition(head, nextCyclePos)
        : null;

    for (const [dirName, delta] of Object.entries(this.directionValues)) {
      const nextPos = { x: head.x + delta.x, y: head.y + delta.y };
      if (!this._isPositionSafe(nextPos, body, gridSize)) {
        continue;
      }
      if (!this._isValidDirectionChange(currentDirection, dirName)) {
        continue;
      }

      const targetIdx = this._getIndex(nextPos);
      if (this._isBetweenOnCycle(tailIdx, headIdx, targetIdx, n)) {
        continue;
      }

      moves.push({
        direction: dirName,
        foodDist: this._forwardDistance(targetIdx, foodIdx, n),
        isCycleStep: dirName === nextCycleDir,
      });
    }

    return moves;
  }

  _followCycle(head, body, headIdx, currentDirection, gridSize) {
    if (headIdx < 0 || this.cycle.length === 0) {
      return this._getEmergencyDirection(head, body, currentDirection, gridSize);
    }

    const n = this.cycle.length;
    const nextPos = this.cycle[(headIdx + 1) % n];
    const dir = this._getDirectionToPosition(head, nextPos);
    if (
      dir &&
      this._isPositionSafe(nextPos, body, gridSize) &&
      this._isValidDirectionChange(currentDirection, dir)
    ) {
      return dir;
    }

    return this._getEmergencyDirection(head, body, currentDirection, gridSize);
  }

  _getEmergencyDirection(head, body, currentDirection, gridSize) {
    for (const [dirName, delta] of Object.entries(this.directionValues)) {
      const nextPos = { x: head.x + delta.x, y: head.y + delta.y };
      if (
        this._isPositionSafe(nextPos, body, gridSize) &&
        this._isValidDirectionChange(currentDirection, dirName)
      ) {
        return dirName;
      }
    }
    return currentDirection;
  }

  _buildEvenGridCycle(width, height) {
    const path = [];
    const indexGrid = Array.from({ length: height }, () => Array(width).fill(-1));
    let idx = 0;

    const add = (x, y) => {
      path.push({ x, y });
      indexGrid[y][x] = idx++;
    };

    for (let x = 0; x < width; x++) {
      add(x, 0);
    }

    for (let y = 1; y < height; y++) {
      add(width - 1, y);
    }

    for (let x = width - 2; x >= 0; x--) {
      add(x, height - 1);
    }

    for (let y = height - 2; y >= 1; y--) {
      const leftToRight = (height - 2 - y) % 2 === 0;
      if (leftToRight) {
        for (let x = 0; x <= width - 2; x++) {
          add(x, y);
        }
      } else {
        for (let x = width - 2; x >= 0; x--) {
          add(x, y);
        }
      }
    }

    return { path, indexGrid };
  }

  _buildCycleFromSnake(snake, currentDirection, gridSize) {
    const tail = snake[snake.length - 1];
    const neck = snake[snake.length - 2];
    const head = snake[0];

    const blocked = new Set([this._posKey(neck)]);
    const longestPath = this._findLongestPath(head, tail, blocked, gridSize);

    if (!longestPath || longestPath.length < 2) {
      return null;
    }

    const path = [...longestPath];
    const indexGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(-1));

    path.forEach((pos, i) => {
      indexGrid[pos.y][pos.x] = i;
    });

    const visited = new Set(path.map((p) => this._posKey(p)));
    let current = path[path.length - 1];

    while (visited.size < gridSize * gridSize) {
      const neighbors = this._getFreeNeighbors(current, visited, gridSize);
      if (neighbors.length === 0) {
        break;
      }

      let bestNeighbor = neighbors[0];
      let bestScore = -1;
      for (const neighbor of neighbors) {
        const score = this._dfsPathLength(neighbor, visited, gridSize, new Set());
        if (score > bestScore) {
          bestScore = score;
          bestNeighbor = neighbor;
        }
      }

      current = bestNeighbor;
      visited.add(this._posKey(current));
      indexGrid[current.y][current.x] = path.length;
      path.push({ ...current });
    }

    if (path.length !== gridSize * gridSize) {
      return null;
    }

    return { path, indexGrid };
  }

  _getFreeNeighbors(pos, visited, gridSize) {
    const neighbors = [];
    for (const delta of Object.values(this.directionValues)) {
      const next = { x: pos.x + delta.x, y: pos.y + delta.y };
      const key = this._posKey(next);
      if (
        next.x >= 0 &&
        next.x < gridSize &&
        next.y >= 0 &&
        next.y < gridSize &&
        !visited.has(key)
      ) {
        neighbors.push(next);
      }
    }
    return neighbors;
  }

  _dfsPathLength(start, visited, gridSize, seen) {
    const key = this._posKey(start);
    if (visited.has(key) || seen.has(key)) {
      return 0;
    }
    seen.add(key);

    let maxLen = 0;
    for (const neighbor of this._getFreeNeighbors(start, visited, gridSize)) {
      maxLen = Math.max(maxLen, 1 + this._dfsPathLength(neighbor, visited, gridSize, seen));
    }
    return maxLen;
  }

  _findLongestPath(start, goal, blocked, gridSize) {
    let longest = null;

    const dfs = (pos, path, visited) => {
      if (pos.x === goal.x && pos.y === goal.y) {
        if (!longest || path.length > longest.length) {
          longest = [...path];
        }
        return;
      }

      for (const delta of Object.values(this.directionValues)) {
        const next = { x: pos.x + delta.x, y: pos.y + delta.y };
        const key = this._posKey(next);
        if (
          next.x < 0 ||
          next.x >= gridSize ||
          next.y < 0 ||
          next.y >= gridSize ||
          blocked.has(key) ||
          visited.has(key)
        ) {
          continue;
        }
        visited.add(key);
        path.push(next);
        dfs(next, path, visited);
        path.pop();
        visited.delete(key);
      }
    };

    const startKey = this._posKey(start);
    const visited = new Set([startKey]);
    dfs(start, [start], visited);
    return longest;
  }
}

const hamiltonSolver = new HamiltonSolver();
window.hamiltonSolver = hamiltonSolver;
