const GRID_SIZE = 20;
const NUM_GRIDS = 10;
const NUM_ROUNDS = 5;
const TICKS_PER_FRAME = 150;
const MAX_TICKS_PER_GAME = 80000;

const DIRECTIONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
};

const INITIAL_POSITION = { x: 10, y: 10 };

class SnakeSimulation {
  constructor(gridId, gridElement, statusElement) {
    this.gridId = gridId;
    this.gridElement = gridElement;
    this.statusElement = statusElement;
    this.solver = new HamiltonSolver();
    this.cells = [];
    this._buildGridDOM();
    this.reset();
  }

  reset() {
    this.snake = [{ ...INITIAL_POSITION }];
    this.food = { x: 15, y: 15 };
    this.direction = DIRECTIONS.RIGHT;
    this.nextDirection = DIRECTIONS.RIGHT;
    this.score = 0;
    this.ticks = 0;
    this.status = "running";
    this.resultDetail = "";

    this.solver.active = true;
    this.solver.cycle = [];
    this.solver.indexGrid = [];
    this.solver.gridSize = 0;

    this.generateFood();
    this._updateStatusLabel();
    this.render();
  }

  _buildGridDOM() {
    this.gridElement.innerHTML = "";
    this.cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        this.gridElement.appendChild(cell);
        row.push(cell);
      }
      this.cells.push(row);
    }
  }

  generateFood() {
    let attempts = 0;
    do {
      this.food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      attempts++;
    } while (
      this.snake.some((s) => s.x === this.food.x && s.y === this.food.y) &&
      attempts < 1000
    );
  }

  checkCollision(head) {
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }
    for (let i = 1; i < this.snake.length; i++) {
      if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
        return true;
      }
    }
    return false;
  }

  tick() {
    if (this.status !== "running") {
      return this.status;
    }

    const hamiltonDir = this.solver.getNextDirection(
      this.snake,
      this.food,
      this.direction,
      GRID_SIZE
    );
    if (hamiltonDir) {
      this.nextDirection = hamiltonDir;
    }

    this.direction = this.nextDirection;

    const head = { ...this.snake[0] };
    switch (this.direction) {
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

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;

      if (this.snake.length === GRID_SIZE * GRID_SIZE - 1) {
        this.status = "win";
        this.resultDetail = `Win @ ${this.ticks} ticks, score ${this.score}`;
        this._updateStatusLabel();
        return this.status;
      }

      this.generateFood();
    } else {
      this.snake.pop();
    }

    if (this.checkCollision(head)) {
      this.status = "lose";
      this.resultDetail = `Lose @ ${this.ticks} ticks, len ${this.snake.length}, score ${this.score}`;
      this._updateStatusLabel();
      return this.status;
    }

    this.ticks++;
    if (this.ticks >= MAX_TICKS_PER_GAME) {
      this.status = "timeout";
      this.resultDetail = `Timeout @ ${this.ticks} ticks, len ${this.snake.length}, score ${this.score}`;
      this._updateStatusLabel();
    }

    return this.status;
  }

  _updateStatusLabel() {
    if (!this.statusElement) return;
    const labels = {
      running: `G${this.gridId} · Running · ${this.score}pts · len ${this.snake.length} · ${this.ticks}t`,
      win: `G${this.gridId} · WIN · ${this.score}pts · ${this.ticks}t`,
      lose: `G${this.gridId} · LOSE · ${this.score}pts · len ${this.snake.length}`,
      timeout: `G${this.gridId} · TIMEOUT · ${this.score}pts · ${this.ticks}t`,
    };
    this.statusElement.textContent = labels[this.status] || this.status;
    this.statusElement.className = `grid-status status-${this.status}`;
  }

  render() {
    if (!this.cells.length) return;

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const cell = this.cells[y][x];
        cell.className = "cell";
        cell.style.position = "";
      }
    }

    for (let i = 1; i < this.snake.length; i++) {
      const seg = this.snake[i];
      if (this.cells[seg.y]?.[seg.x]) {
        this.cells[seg.y][seg.x].classList.add("snake");
      }
    }

    const head = this.snake[0];
    if (this.cells[head.y]?.[head.x]) {
      const headCell = this.cells[head.y][head.x];
      headCell.classList.add("snake-head");
      headCell.style.position = "relative";
    }

    if (this.status === "running" && this.cells[this.food.y]?.[this.food.x]) {
      const foodCell = this.cells[this.food.y][this.food.x];
      foodCell.classList.add("food");
      foodCell.style.position = "relative";
    }

    this._updateStatusLabel();
  }

  getResult() {
    return {
      gridId: this.gridId,
      status: this.status,
      score: this.score,
      length: this.snake.length,
      ticks: this.ticks,
      detail: this.resultDetail,
    };
  }
}

const testState = {
  games: [],
  currentRound: 0,
  allResults: [],
  roundResults: [],
  running: false,
  startTime: 0,
};

function initTestPage() {
  const gridsContainer = document.getElementById("grids-container");
  if (!gridsContainer) {
    console.error("hamilton-test: #grids-container not found");
    return;
  }
  gridsContainer.innerHTML = "";

  testState.games = [];
  for (let i = 0; i < NUM_GRIDS; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "grid-wrapper";

    const statusEl = document.createElement("div");
    statusEl.className = "grid-status status-idle";
    statusEl.textContent = `Grid ${i + 1} · Idle`;

    const gridEl = document.createElement("div");
    gridEl.className = "grid benchmark-grid";
    gridEl.id = `test-grid-${i}`;

    wrapper.appendChild(statusEl);
    wrapper.appendChild(gridEl);
    gridsContainer.appendChild(wrapper);

    testState.games.push(new SnakeSimulation(i + 1, gridEl, statusEl));
  }

  document.getElementById("start-btn").addEventListener("click", startBenchmark);
  document.getElementById("reset-btn").addEventListener("click", resetBenchmark);
  updateProgressUI();
}

function resetBenchmark() {
  testState.running = false;
  testState.currentRound = 0;
  testState.allResults = [];
  testState.roundResults = [];
  testState.games.forEach((g) => g.reset());
  document.getElementById("report-panel").classList.add("hidden");
  document.getElementById("report-body").innerHTML = "";
  updateProgressUI();
  setControlsEnabled(true);
}

function setControlsEnabled(enabled) {
  document.getElementById("start-btn").disabled = !enabled;
}

function updateProgressUI() {
  const totalGames = NUM_GRIDS * NUM_ROUNDS;
  const completed = testState.allResults.length;
  document.getElementById("progress-text").textContent =
    `Round ${testState.currentRound}/${NUM_ROUNDS} · Games ${completed}/${totalGames}`;
}

function startBenchmark() {
  if (testState.running) return;
  if (!testState.games.length) {
    console.error("hamilton-test: no games initialized");
    return;
  }

  resetBenchmark();
  testState.running = true;
  testState.startTime = performance.now();
  setControlsEnabled(false);
  testState.currentRound = 1;
  startRound();
}

function startRound() {
  testState.roundResults = [];
  testState.games.forEach((g) => g.reset());
  updateProgressUI();
  runRoundLoop();
}

function runRoundLoop() {
  if (!testState.running) return;

  let allDone = true;

  for (const game of testState.games) {
    if (game.status === "running") {
      allDone = false;
      for (let i = 0; i < TICKS_PER_FRAME; i++) {
        game.tick();
        if (game.status !== "running") break;
      }
      game.render();
    }
  }

  if (!allDone) {
    requestAnimationFrame(runRoundLoop);
    return;
  }

  for (const game of testState.games) {
    const result = { ...game.getResult(), round: testState.currentRound };
    testState.roundResults.push(result);
    testState.allResults.push(result);
  }

  updateProgressUI();

  if (testState.currentRound < NUM_ROUNDS) {
    testState.currentRound++;
    requestAnimationFrame(() => {
      setTimeout(startRound, 300);
    });
    return;
  }

  testState.running = false;
  const elapsed = ((performance.now() - testState.startTime) / 1000).toFixed(2);
  showReport(elapsed);
  setControlsEnabled(true);
}

function showReport(elapsedSeconds) {
  const results = testState.allResults;
  const wins = results.filter((r) => r.status === "win");
  const losses = results.filter((r) => r.status === "lose");
  const timeouts = results.filter((r) => r.status === "timeout");
  const total = results.length;

  const winRate = total ? ((wins.length / total) * 100).toFixed(1) : "0.0";
  const avgWinTicks = wins.length
    ? Math.round(wins.reduce((s, r) => s + r.ticks, 0) / wins.length)
    : 0;
  const avgLossScore = losses.length
    ? Math.round(losses.reduce((s, r) => s + r.score, 0) / losses.length)
    : 0;
  const avgLossLength = losses.length
    ? Math.round(losses.reduce((s, r) => s + r.length, 0) / losses.length)
    : 0;

  const summaryHtml = `
    <div class="report-summary">
      <div class="stat-card win"><span class="stat-value">${wins.length}</span><span class="stat-label">Vittorie</span></div>
      <div class="stat-card lose"><span class="stat-value">${losses.length}</span><span class="stat-label">Sconfitte</span></div>
      <div class="stat-card timeout"><span class="stat-value">${timeouts.length}</span><span class="stat-label">Timeout</span></div>
      <div class="stat-card rate"><span class="stat-value">${winRate}%</span><span class="stat-label">Win rate</span></div>
      <div class="stat-card"><span class="stat-value">${elapsedSeconds}s</span><span class="stat-label">Tempo totale</span></div>
      <div class="stat-card"><span class="stat-value">${avgWinTicks}</span><span class="stat-label">Tick medi (win)</span></div>
      <div class="stat-card"><span class="stat-value">${avgLossScore}</span><span class="stat-label">Score medio (loss)</span></div>
      <div class="stat-card"><span class="stat-value">${avgLossLength}</span><span class="stat-label">Lunghezza media (loss)</span></div>
    </div>
  `;

  let roundRows = "";
  for (let round = 1; round <= NUM_ROUNDS; round++) {
    const roundData = results.filter((r) => r.round === round);
    const rWins = roundData.filter((r) => r.status === "win").length;
    const rLosses = roundData.filter((r) => r.status === "lose").length;
    const rTimeouts = roundData.filter((r) => r.status === "timeout").length;
    roundRows += `<tr>
      <td>Round ${round}</td>
      <td class="win-cell">${rWins}</td>
      <td class="lose-cell">${rLosses}</td>
      <td>${rTimeouts}</td>
      <td>${((rWins / NUM_GRIDS) * 100).toFixed(0)}%</td>
    </tr>`;
  }

  let detailRows = results
    .map(
      (r) => `<tr>
      <td>R${r.round} G${r.gridId}</td>
      <td class="status-${r.status}">${r.status.toUpperCase()}</td>
      <td>${r.score}</td>
      <td>${r.length}</td>
      <td>${r.ticks}</td>
    </tr>`
    )
    .join("");

  const body = document.getElementById("report-body");
  body.innerHTML = `
    ${summaryHtml}
    <h3>Per round (${NUM_GRIDS} partite parallele)</h3>
    <table class="report-table">
      <thead><tr><th>Round</th><th>Win</th><th>Lose</th><th>Timeout</th><th>Win %</th></tr></thead>
      <tbody>${roundRows}</tbody>
    </table>
    <h3>Dettaglio tutte le ${total} partite</h3>
    <table class="report-table detail-table">
      <thead><tr><th>Partita</th><th>Esito</th><th>Score</th><th>Lunghezza</th><th>Tick</th></tr></thead>
      <tbody>${detailRows}</tbody>
    </table>
    <p class="report-note">
      Config: ${NUM_GRIDS} griglie × ${NUM_ROUNDS} round = ${total} partite ·
      Griglia ${GRID_SIZE}×${GRID_SIZE} ·
      ${TICKS_PER_FRAME} tick/frame ·
      endgameFillRatio = ${testState.games[0]?.solver.endgameFillRatio ?? 0.75}
    </p>
  `;

  document.getElementById("report-panel").classList.remove("hidden");
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initTestPage);
} else {
  initTestPage();
}
