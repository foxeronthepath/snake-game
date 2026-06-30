const GRID_SIZE = 20;
const NUM_GRIDS = 10;
const DEFAULT_NUM_ROUNDS = 5;
const MAX_TICKS_PER_GAME = 80000;

const SPEED_PRESETS = {
  normal: { label: "Normale", msPerTick: 150 },
  fast: { label: "Veloce", msPerTick: 10 },
  turbo: { label: "Turbo", msPerTick: 1 },
};
const DEFAULT_SPEED = "normal";

const DIRECTIONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
};

const INITIAL_POSITION = { x: 10, y: 10 };

const AUTOPILOT_MODES = {
  hamilton: {
    label: "Hamilton Solver",
    create: () => new HamiltonSolver(),
    prepare(autopilot) {
      autopilot.active = true;
      autopilot.cycle = [];
      autopilot.indexGrid = [];
      autopilot.gridSize = 0;
    },
    reportNote(autopilot) {
      return `endgameFillRatio = ${autopilot.endgameFillRatio}`;
    },
  },
  smart: {
    label: "Smart Autopilot",
    create: () => new SmartSnakeAutopilot(),
    prepare(autopilot) {
      autopilot.active = true;
    },
    reportNote() {
      return "A* pathfinding · bordered mode";
    },
  },
  lawnmower: {
    label: "Lawnmower",
    create: () => new LawnmowerAutopilot(),
    prepare(autopilot) {
      autopilot.active = true;
      autopilot.resetPattern();
    },
    reportNote() {
      return "fixed lawnmower pattern";
    },
  },
};

function getSelectedAutopilotMode() {
  const select = document.getElementById("autopilot-select");
  const mode = select?.value ?? "hamilton";
  return AUTOPILOT_MODES[mode] ? mode : "hamilton";
}

function getSelectedNumRounds() {
  const select = document.getElementById("rounds-select");
  const rounds = parseInt(select?.value ?? String(DEFAULT_NUM_ROUNDS), 10);
  return Number.isFinite(rounds) && rounds > 0 ? rounds : DEFAULT_NUM_ROUNDS;
}

function getSelectedSpeed() {
  const select = document.getElementById("speed-select");
  const key = select?.value ?? DEFAULT_SPEED;
  return SPEED_PRESETS[key] ? { key, ...SPEED_PRESETS[key] } : { key: DEFAULT_SPEED, ...SPEED_PRESETS[DEFAULT_SPEED] };
}

function formatSpeedDescription(speed) {
  return `${speed.msPerTick}ms`;
}

function formatSeconds(seconds) {
  if (seconds < 10) {
    return `${seconds.toFixed(1)}s`;
  }
  return `${Math.round(seconds)}s`;
}

function getAutopilotLabel(mode) {
  return AUTOPILOT_MODES[mode]?.label ?? mode;
}

class SnakeSimulation {
  constructor(gridId, gridElement, statusElement, autopilotMode) {
    this.gridId = gridId;
    this.gridElement = gridElement;
    this.statusElement = statusElement;
    this.autopilotMode = autopilotMode;
    this.autopilot = this._createAutopilot(autopilotMode);
    this.cells = [];
    this._buildGridDOM();
    this.reset();
  }

  _createAutopilot(mode) {
    const config = AUTOPILOT_MODES[mode];
    if (!config) {
      throw new Error(`Unknown autopilot mode: ${mode}`);
    }
    return config.create();
  }

  setAutopilotMode(mode) {
    this.autopilotMode = mode;
    this.autopilot = this._createAutopilot(mode);
    this.reset();
  }

  reset() {
    this.snake = [{ ...INITIAL_POSITION }];
    this.food = { x: 15, y: 15 };
    this.direction = DIRECTIONS.RIGHT;
    this.nextDirection = DIRECTIONS.RIGHT;
    this.score = 0;
    this.ticks = 0;
    this.startedAt = performance.now();
    this.elapsedSeconds = 0;
    this.tickBudget = 0;
    this.status = "running";
    this.resultDetail = "";

    AUTOPILOT_MODES[this.autopilotMode].prepare(this.autopilot);

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

  _getElapsedSeconds() {
    return (performance.now() - this.startedAt) / 1000;
  }

  _finalizeElapsed() {
    this.elapsedSeconds = this._getElapsedSeconds();
  }

  tick() {
    if (this.status !== "running") {
      return this.status;
    }

    const autopilotDir = this.autopilot.getNextDirection(
      this.snake,
      this.food,
      this.direction,
      GRID_SIZE
    );
    if (autopilotDir) {
      this.nextDirection = autopilotDir;
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
        this._finalizeElapsed();
        this.resultDetail = `Win @ ${formatSeconds(this.elapsedSeconds)}, score ${this.score}`;
        this._updateStatusLabel();
        return this.status;
      }

      this.generateFood();
    } else {
      this.snake.pop();
    }

    if (this.checkCollision(head)) {
      this.status = "lose";
      this._finalizeElapsed();
      this.resultDetail = `Lose @ ${formatSeconds(this.elapsedSeconds)}, len ${this.snake.length}, score ${this.score}`;
      this._updateStatusLabel();
      return this.status;
    }

    this.ticks++;
    if (this.ticks >= MAX_TICKS_PER_GAME) {
      this.status = "timeout";
      this._finalizeElapsed();
      this.resultDetail = `Timeout @ ${formatSeconds(this.elapsedSeconds)}, len ${this.snake.length}, score ${this.score}`;
      this._updateStatusLabel();
    }

    return this.status;
  }

  _updateStatusLabel() {
    if (!this.statusElement) return;
    const modeTag = getAutopilotLabel(this.autopilotMode).split(" ")[0];
    const seconds =
      this.status === "running" ? this._getElapsedSeconds() : this.elapsedSeconds;
    const timeLabel = formatSeconds(seconds);
    const labels = {
      running: `G${this.gridId} · ${modeTag} · ${this.score}pts · len ${this.snake.length} · ${timeLabel}`,
      win: `G${this.gridId} · WIN · ${this.score}pts · ${timeLabel}`,
      lose: `G${this.gridId} · LOSE · ${this.score}pts · len ${this.snake.length}`,
      timeout: `G${this.gridId} · TIMEOUT · ${this.score}pts · ${timeLabel}`,
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
      autopilotMode: this.autopilotMode,
      status: this.status,
      score: this.score,
      length: this.snake.length,
      seconds: this.elapsedSeconds || this._getElapsedSeconds(),
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
  autopilotMode: "hamilton",
  numRounds: DEFAULT_NUM_ROUNDS,
  speedKey: DEFAULT_SPEED,
  speedLabel: SPEED_PRESETS[DEFAULT_SPEED].label,
  msPerTick: SPEED_PRESETS[DEFAULT_SPEED].msPerTick,
  lastFrameTime: 0,
};

function initTestPage() {
  const gridsContainer = document.getElementById("grids-container");
  if (!gridsContainer) {
    console.error("benchmark: #grids-container not found");
    return;
  }
  gridsContainer.innerHTML = "";

  testState.autopilotMode = getSelectedAutopilotMode();

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

    testState.games.push(
      new SnakeSimulation(i + 1, gridEl, statusEl, testState.autopilotMode)
    );
  }

  const autopilotSelect = document.getElementById("autopilot-select");
  if (autopilotSelect) {
    autopilotSelect.value = testState.autopilotMode;
    autopilotSelect.addEventListener("change", () => {
      if (testState.running) return;
      testState.autopilotMode = getSelectedAutopilotMode();
      testState.games.forEach((g) => g.setAutopilotMode(testState.autopilotMode));
    });
  }

  const roundsSelect = document.getElementById("rounds-select");
  if (roundsSelect) {
    roundsSelect.addEventListener("change", () => {
      if (testState.running) return;
      testState.numRounds = getSelectedNumRounds();
      updateProgressUI();
    });
  }

  const speedSelect = document.getElementById("speed-select");
  if (speedSelect) {
    speedSelect.value = testState.speedKey;
    speedSelect.addEventListener("change", () => {
      if (testState.running) return;
      const speed = getSelectedSpeed();
      testState.speedKey = speed.key;
      testState.speedLabel = speed.label;
      testState.msPerTick = speed.msPerTick;
      updateProgressUI();
    });
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
  document.getElementById("autopilot-select")?.toggleAttribute("disabled", !enabled);
  document.getElementById("rounds-select")?.toggleAttribute("disabled", !enabled);
  document.getElementById("speed-select")?.toggleAttribute("disabled", !enabled);
}

function updateProgressUI() {
  const numRounds = testState.running ? testState.numRounds : getSelectedNumRounds();
  const speed = testState.running
    ? {
        label: testState.speedLabel,
        msPerTick: testState.msPerTick,
      }
    : getSelectedSpeed();
  const totalGames = NUM_GRIDS * numRounds;
  const completed = testState.allResults.length;
  document.getElementById("progress-text").textContent =
    `Round ${testState.currentRound}/${numRounds} · Games ${completed}/${totalGames}`;

  const subtitle = document.getElementById("benchmark-subtitle");
  if (subtitle) {
    subtitle.textContent =
      `${NUM_GRIDS} griglie in parallelo · ${numRounds} round · ${totalGames} partite · ${speed.label} (${formatSpeedDescription(speed)})`;
  }
}

function startBenchmark() {
  if (testState.running) return;
  if (!testState.games.length) {
    console.error("benchmark: no games initialized");
    return;
  }

  resetBenchmark();
  testState.autopilotMode = getSelectedAutopilotMode();
  testState.numRounds = getSelectedNumRounds();
  const speed = getSelectedSpeed();
  testState.speedKey = speed.key;
  testState.speedLabel = speed.label;
  testState.msPerTick = speed.msPerTick;
  testState.games.forEach((g) => g.setAutopilotMode(testState.autopilotMode));
  updateProgressUI();
  testState.running = true;
  testState.startTime = performance.now();
  setControlsEnabled(false);
  testState.currentRound = 1;
  startRound();
}

function startRound() {
  testState.roundResults = [];
  testState.lastFrameTime = performance.now();
  testState.games.forEach((g) => g.reset());
  updateProgressUI();
  runRoundLoop();
}

function runRoundLoop() {
  if (!testState.running) return;

  const now = performance.now();
  const frameDelta = testState.lastFrameTime ? now - testState.lastFrameTime : 0;
  testState.lastFrameTime = now;

  let allDone = true;

  for (const game of testState.games) {
    if (game.status === "running") {
      allDone = false;

      game.tickBudget += frameDelta;
      while (game.tickBudget >= testState.msPerTick && game.status === "running") {
        game.tick();
        game.tickBudget -= testState.msPerTick;
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

  if (testState.currentRound < testState.numRounds) {
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
  const avgWinSeconds = wins.length
    ? wins.reduce((s, r) => s + r.seconds, 0) / wins.length
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
      <div class="stat-card"><span class="stat-value">${formatSeconds(avgWinSeconds)}</span><span class="stat-label">Secondi medi (win)</span></div>
      <div class="stat-card"><span class="stat-value">${avgLossScore}</span><span class="stat-label">Score medio (loss)</span></div>
      <div class="stat-card"><span class="stat-value">${avgLossLength}</span><span class="stat-label">Lunghezza media (loss)</span></div>
    </div>
  `;

  let roundRows = "";
  for (let round = 1; round <= testState.numRounds; round++) {
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
      <td>${formatSeconds(r.seconds)}</td>
    </tr>`
    )
    .join("");

  const body = document.getElementById("report-body");
  const mode = testState.autopilotMode;
  const modeConfig = AUTOPILOT_MODES[mode];
  const sampleAutopilot = testState.games[0]?.autopilot;
  const modeNote =
    modeConfig && sampleAutopilot
      ? modeConfig.reportNote(sampleAutopilot)
      : "";

  body.innerHTML = `
    ${summaryHtml}
    <h3>Grafici</h3>
    <div class="report-charts">
      <div class="chart-card">
        <h4>Distribuzione esiti</h4>
        <canvas id="chart-outcomes" class="report-chart"></canvas>
      </div>
      <div class="chart-card">
        <h4>Win rate per round</h4>
        <canvas id="chart-rounds" class="report-chart"></canvas>
      </div>
      <div class="chart-card chart-wide">
        <h4>Durata partite (secondi)</h4>
        <canvas id="chart-duration" class="report-chart"></canvas>
      </div>
      <div class="chart-card chart-wide">
        <h4>Score finale per partita</h4>
        <canvas id="chart-scores" class="report-chart"></canvas>
      </div>
    </div>
    <h3>Per round (${NUM_GRIDS} partite parallele)</h3>
    <table class="report-table">
      <thead><tr><th>Round</th><th>Win</th><th>Lose</th><th>Timeout</th><th>Win %</th></tr></thead>
      <tbody>${roundRows}</tbody>
    </table>
    <h3>Dettaglio tutte le ${total} partite</h3>
    <table class="report-table detail-table">
      <thead><tr><th>Partita</th><th>Esito</th><th>Score</th><th>Lunghezza</th><th>Secondi</th></tr></thead>
      <tbody>${detailRows}</tbody>
    </table>
    <p class="report-note">
      Autopilota: <strong>${getAutopilotLabel(mode)}</strong> ·
      Velocità: <strong>${testState.speedLabel}</strong> (${testState.msPerTick}ms) ·
      ${NUM_GRIDS} griglie × ${testState.numRounds} round = ${total} partite ·
      Griglia ${GRID_SIZE}×${GRID_SIZE} ·
      ${modeNote}
    </p>
  `;

  document.getElementById("report-panel").classList.remove("hidden");
  renderReportCharts(results, testState.numRounds);
}

const CHART_COLORS = {
  win: "#01b80a",
  lose: "#f12d2d",
  timeout: "#f5b041",
  text: "#f0f0f0",
  muted: "rgba(240,240,240,0.55)",
  grid: "rgba(134,134,134,0.35)",
  barBg: "rgba(255,255,255,0.06)",
};

function setupChartCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 300;
  const height = canvas.clientHeight || 220;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

function drawOutcomeChart(canvas, wins, losses, timeouts) {
  const { ctx, width, height } = setupChartCanvas(canvas);
  const total = wins + losses + timeouts;
  const cx = width * 0.38;
  const cy = height * 0.5;
  const radius = Math.min(width, height) * 0.32;
  const inner = radius * 0.55;

  ctx.clearRect(0, 0, width, height);

  if (total === 0) {
    ctx.fillStyle = CHART_COLORS.muted;
    ctx.font = "13px Arial, sans-serif";
    ctx.fillText("Nessun dato", 16, height / 2);
    return;
  }

  const slices = [
    { value: wins, color: CHART_COLORS.win, label: "Win" },
    { value: losses, color: CHART_COLORS.lose, label: "Lose" },
    { value: timeouts, color: CHART_COLORS.timeout, label: "Timeout" },
  ].filter((s) => s.value > 0);

  let start = -Math.PI / 2;
  for (const slice of slices) {
    const angle = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    start += angle;
  }

  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fillStyle = "#333";
  ctx.fill();

  ctx.fillStyle = CHART_COLORS.text;
  ctx.font = "bold 18px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${((wins / total) * 100).toFixed(0)}%`, cx, cy + 6);

  let legendY = 28;
  const legendX = width * 0.68;
  ctx.textAlign = "left";
  ctx.font = "12px Arial, sans-serif";
  for (const slice of slices) {
    ctx.fillStyle = slice.color;
    ctx.fillRect(legendX, legendY - 10, 12, 12);
    ctx.fillStyle = CHART_COLORS.text;
    ctx.fillText(
      `${slice.label}: ${slice.value} (${((slice.value / total) * 100).toFixed(0)}%)`,
      legendX + 18,
      legendY
    );
    legendY += 22;
  }
}

function drawRoundWinRateChart(canvas, results, numRounds) {
  const { ctx, width, height } = setupChartCanvas(canvas);
  const pad = { top: 20, right: 16, bottom: 36, left: 36 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  ctx.clearRect(0, 0, width, height);

  const rates = [];
  for (let round = 1; round <= numRounds; round++) {
    const roundData = results.filter((r) => r.round === round);
    const rWins = roundData.filter((r) => r.status === "win").length;
    rates.push(roundData.length ? (rWins / roundData.length) * 100 : 0);
  }

  const barGap = 8;
  const barW = Math.max(12, (chartW - barGap * (numRounds - 1)) / numRounds);

  ctx.strokeStyle = CHART_COLORS.grid;
  ctx.fillStyle = CHART_COLORS.muted;
  ctx.font = "11px Arial, sans-serif";
  ctx.textAlign = "right";
  for (let pct = 0; pct <= 100; pct += 25) {
    const y = pad.top + chartH - (pct / 100) * chartH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    ctx.fillText(`${pct}%`, pad.left - 6, y + 4);
  }

  rates.forEach((rate, i) => {
    const x = pad.left + i * (barW + barGap);
    const barH = (rate / 100) * chartH;
    const y = pad.top + chartH - barH;

    ctx.fillStyle = CHART_COLORS.barBg;
    ctx.fillRect(x, pad.top, barW, chartH);

    ctx.fillStyle = rate >= 50 ? CHART_COLORS.win : CHART_COLORS.lose;
    ctx.fillRect(x, y, barW, barH);

    ctx.fillStyle = CHART_COLORS.text;
    ctx.textAlign = "center";
    ctx.fillText(`R${i + 1}`, x + barW / 2, height - 12);
    if (rate > 0) {
      ctx.fillText(`${rate.toFixed(0)}%`, x + barW / 2, y - 6);
    }
  });
}

function drawDurationChart(canvas, results) {
  const { ctx, width, height } = setupChartCanvas(canvas);
  const pad = { top: 20, right: 16, bottom: 36, left: 44 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  ctx.clearRect(0, 0, width, height);

  if (!results.length) return;

  const maxSec = Math.max(...results.map((r) => r.seconds), 1);
  const barGap = 2;
  const barW = Math.max(3, (chartW - barGap * (results.length - 1)) / results.length);

  ctx.strokeStyle = CHART_COLORS.grid;
  ctx.fillStyle = CHART_COLORS.muted;
  ctx.font = "11px Arial, sans-serif";
  ctx.textAlign = "right";
  const ySteps = 4;
  for (let i = 0; i <= ySteps; i++) {
    const val = (maxSec / ySteps) * i;
    const y = pad.top + chartH - (val / maxSec) * chartH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    ctx.fillText(formatSeconds(val), pad.left - 6, y + 4);
  }

  results.forEach((r, i) => {
    const x = pad.left + i * (barW + barGap);
    const barH = (r.seconds / maxSec) * chartH;
    const y = pad.top + chartH - barH;
    const color =
      r.status === "win"
        ? CHART_COLORS.win
        : r.status === "lose"
          ? CHART_COLORS.lose
          : CHART_COLORS.timeout;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barW, barH);
  });

  ctx.fillStyle = CHART_COLORS.muted;
  ctx.textAlign = "center";
  ctx.fillText("Partita (ordine cronologico)", pad.left + chartW / 2, height - 10);
}

function drawScoreChart(canvas, results) {
  const { ctx, width, height } = setupChartCanvas(canvas);
  const pad = { top: 20, right: 16, bottom: 36, left: 44 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  ctx.clearRect(0, 0, width, height);

  if (!results.length) return;

  const maxScore = Math.max(...results.map((r) => r.score), 10);
  const barGap = 2;
  const barW = Math.max(3, (chartW - barGap * (results.length - 1)) / results.length);

  ctx.strokeStyle = CHART_COLORS.grid;
  ctx.fillStyle = CHART_COLORS.muted;
  ctx.font = "11px Arial, sans-serif";
  ctx.textAlign = "right";
  const ySteps = 4;
  for (let i = 0; i <= ySteps; i++) {
    const val = Math.round((maxScore / ySteps) * i);
    const y = pad.top + chartH - (val / maxScore) * chartH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    ctx.fillText(String(val), pad.left - 6, y + 4);
  }

  results.forEach((r, i) => {
    const x = pad.left + i * (barW + barGap);
    const barH = (r.score / maxScore) * chartH;
    const y = pad.top + chartH - barH;
    const color =
      r.status === "win"
        ? CHART_COLORS.win
        : r.status === "lose"
          ? CHART_COLORS.lose
          : CHART_COLORS.timeout;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barW, barH);
  });

  ctx.strokeStyle = "rgba(226,53,0,0.6)";
  ctx.setLineDash([4, 4]);
  const winLine = pad.top + chartH - (3980 / maxScore) * chartH;
  if (3980 <= maxScore) {
    ctx.beginPath();
    ctx.moveTo(pad.left, winLine);
    ctx.lineTo(pad.left + chartW, winLine);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#e23500";
    ctx.textAlign = "left";
    ctx.fillText("Vittoria (3980)", pad.left + 4, winLine - 6);
  }

  ctx.fillStyle = CHART_COLORS.muted;
  ctx.textAlign = "center";
  ctx.fillText("Partita (ordine cronologico)", pad.left + chartW / 2, height - 10);
}

function renderReportCharts(results, numRounds) {
  const wins = results.filter((r) => r.status === "win").length;
  const losses = results.filter((r) => r.status === "lose").length;
  const timeouts = results.filter((r) => r.status === "timeout").length;

  const outcomes = document.getElementById("chart-outcomes");
  const rounds = document.getElementById("chart-rounds");
  const duration = document.getElementById("chart-duration");
  const scores = document.getElementById("chart-scores");

  if (outcomes) drawOutcomeChart(outcomes, wins, losses, timeouts);
  if (rounds) drawRoundWinRateChart(rounds, results, numRounds);
  if (duration) drawDurationChart(duration, results);
  if (scores) drawScoreChart(scores, results);
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initTestPage);
} else {
  initTestPage();
}
