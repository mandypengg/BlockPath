const ROWS = 20;
const COLS = 20;
let grid = [];

const start = [1, 1];
const end   = [19, 19];

let speed = 21;
let mouseDown = false;
let currentRunId = 0;

// ------------------ SPEED ------------------
const speedSlider = document.getElementById("speedSlider");
 
function updateSliderFill(slider) {
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.setProperty("--fill", pct + "%");
}
 
speedSlider.addEventListener("input", e => {
  speed = 101 - e.target.value;
  updateSliderFill(e.target);
});
 
updateSliderFill(speedSlider);

// ------------------ MOUSE ------------------
document.body.onmousedown = () => mouseDown = true;
document.body.onmouseup   = () => mouseDown = false;

// ------------------ GRID ------------------
function createGrid() {
  const gridEl = document.getElementById("grid");

  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.addEventListener("mousedown", () => toggleWall(r, c));
      cell.addEventListener("mouseover", () => { if (mouseDown) toggleWall(r, c); });
      gridEl.appendChild(cell);
      row.push({ row: r, col: c, isWall: false, element: cell, prev: null });
    }
    grid.push(row);
  }

  markStartEnd();
}

function markStartEnd() {
  grid[start[0]][start[1]].element.classList.add("start");
  grid[end[0]][end[1]].element.classList.add("end");
}

createGrid();

// ------------------ WALL TOGGLE ------------------
function toggleWall(r, c) {
  if ((r === start[0] && c === start[1]) || (r === end[0] && c === end[1])) return;
  const cell = grid[r][c];
  cell.isWall = !cell.isWall;
  cell.element.classList.toggle("wall", cell.isWall);
}

// ---------------- RUN ALGORITHM -------------------
function runAlgorithm() {
  const algo = document.getElementById("algoSelect").value;
  if (algo === "bfs")      runBFS();
  else if (algo === "dijkstra") runDijkstra();
  else if (algo === "astar")    runAStar();
}

// ------------------ BFS ------------------
async function runBFS() {
  clearPath();
  const runId = ++currentRunId;
  const t0 = performance.now();
  let visitedCount = 0;

  const startNode = grid[start[0]][start[1]];
  const queue = [startNode];
  const visited = new Set([nodeKey(startNode)]);

  while (queue.length > 0) {
    if (runId !== currentRunId) return;
    const current = queue.shift();

    if (isEnd(current)) {
      const len = await drawPath(current, runId);
      if (runId === currentRunId) updateStats("BFS", performance.now() - t0, visitedCount, len);
      return;
    }

    for (const neighbor of getNeighbors(current.row, current.col)) {
      const key = nodeKey(neighbor);
      if (!visited.has(key) && !neighbor.isWall) {
        visited.add(key);
        neighbor.prev = current;
        queue.push(neighbor);
        neighbor.element.classList.add("visited");
        visitedCount++;
        await sleep(speed);
        if (runId !== currentRunId) return;
      }
    }
  }
}

// ------------------ DIJKSTRA ------------------
async function runDijkstra() {
  clearPath();
  const runId = ++currentRunId;
  const t0 = performance.now();
  let visitedCount = 0;

  for (const row of grid)
    for (const cell of row) { cell.distance = Infinity; cell.prev = null; }

  grid[start[0]][start[1]].distance = 0;

  const unvisited = grid.flat();

  while (unvisited.length > 0) {
    if (runId !== currentRunId) return;

    unvisited.sort((a, b) => a.distance - b.distance);
    const current = unvisited.shift();

    if (current.isWall || current.distance === Infinity) break;

    current.element.classList.add("visited");
    visitedCount++;
    await sleep(speed);
    if (runId !== currentRunId) return;

    if (isEnd(current)) {
      const len = await drawPath(current, runId);
      if (runId === currentRunId) updateStats("Dijkstra", performance.now() - t0, visitedCount, len);
      return;
    }

    for (const neighbor of getNeighbors(current.row, current.col)) {
      if (!neighbor.isWall && current.distance + 1 < neighbor.distance) {
        neighbor.distance = current.distance + 1;
        neighbor.prev = current;
      }
    }
  }
}

// ------------------ A* ------------------
async function runAStar() {
  clearPath();
  const runId = ++currentRunId;
  const t0 = performance.now();
  let visitedCount = 0;

  for (const row of grid)
    for (const cell of row) { cell.g = Infinity; cell.f = Infinity; cell.prev = null; }

  const startNode = grid[start[0]][start[1]];
  const endNode   = grid[end[0]][end[1]];
  startNode.g = 0;
  startNode.f = heuristic(startNode, endNode);

  const openSet = [startNode];

  while (openSet.length > 0) {
    if (runId !== currentRunId) return;

    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    if (current.isWall) continue;

    current.element.classList.add("visited");
    visitedCount++;
    await sleep(speed);
    if (runId !== currentRunId) return;

    if (isEnd(current)) {
      const len = await drawPath(current, runId);
      if (runId === currentRunId) updateStats("A*", performance.now() - t0, visitedCount, len);
      return;
    }

    for (const neighbor of getNeighbors(current.row, current.col)) {
      if (neighbor.isWall) continue;
      const tempG = current.g + 1;
      if (tempG < neighbor.g) {
        neighbor.g = tempG;
        neighbor.f = tempG + heuristic(neighbor, endNode);
        neighbor.prev = current;
        if (!openSet.includes(neighbor)) openSet.push(neighbor);
      }
    }
  }
}

function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// ------------------ MAZE ------------------
// Start [1,1] and End [19,19] 
function generateMaze() {
  clearGrid(); 

  for (const row of grid)
    for (const cell of row) {
      cell.isWall = true;
      cell.element.classList.add("wall");
    }

  function carve(r, c) {
    for (const [dr, dc] of shuffle([[0,2],[2,0],[0,-2],[-2,0]])) {
      const nr = r + dr, nc = c + dc;
      if (nr > 0 && nr < ROWS && nc > 0 && nc < COLS && grid[nr][nc].isWall) {
        setOpen(r + dr / 2, c + dc / 2);
        setOpen(nr, nc);
        carve(nr, nc);
      }
    }
  }

  setOpen(start[0], start[1]);
  carve(start[0], start[1]);

  setOpen(end[0], end[1]);

  markStartEnd();
}

function setOpen(r, c) {
  grid[r][c].isWall = false;
  grid[r][c].element.classList.remove("wall");
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ------------------ HELPERS ------------------
function getNeighbors(r, c) {
  return [[0,1],[1,0],[0,-1],[-1,0]]
    .map(([dr, dc]) => [r + dr, c + dc])
    .filter(([nr, nc]) => nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS)
    .map(([nr, nc]) => grid[nr][nc]);
}

function isEnd(node) {
  return node.row === end[0] && node.col === end[1];
}

function nodeKey(node) {
  return `${node.row}-${node.col}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ------------------ PATH ------------------
async function drawPath(node, runId) {
  let current = node;
  let length = 0;
  while (current.prev) {
    if (runId !== currentRunId) return 0;
    current = current.prev;
    if (current.row !== start[0] || current.col !== start[1]) {
      current.element.classList.add("path");
    }
    length++;
    await sleep(speed);
  }
  return length;
}

// ------------------ CLEAR ------------------
function clearPath() {
  for (const row of grid)
    for (const cell of row) {
      cell.element.classList.remove("visited", "path");
      cell.prev = null;
    }
}

function clearGrid() {
  currentRunId++; // cancels any running algorithm
  for (const row of grid)
    for (const cell of row) {
      cell.element.classList.remove("visited", "path", "wall");
      cell.isWall = false;
      cell.prev = null;
    }
  markStartEnd();
  resetStats();
}

// ------------------ STATS ------------------
function updateStats(algo, time, visited, pathLength) {
  document.getElementById("algo").textContent    = algo;
  document.getElementById("time").textContent    = time.toFixed(1) + " ms";
  document.getElementById("visited").textContent = visited;
  document.getElementById("path").textContent    = pathLength;
}

function resetStats() {
  ["algo", "time", "visited", "path"].forEach(id => {
    document.getElementById(id).textContent = "—";
  });
}