const rows = 20;
const cols = 20;
let grid = [];

let start = [0, 0];
let end = [19, 19];

let speed = 20;
let mouseDown = false;

// ------------------ SPEED ------------------
document.getElementById("speedSlider").addEventListener("input", (e) => {
  speed = 101 - e.target.value;
});

// ------------------ MOUSE ------------------
document.body.onmousedown = () => mouseDown = true;
document.body.onmouseup = () => mouseDown = false;

// ------------------ GRID ------------------
function createGrid() {
  const gridElement = document.getElementById("grid");

  for (let r = 0; r < rows; r++) {
    let row = [];

    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      cell.dataset.row = r;
      cell.dataset.col = c;

      cell.addEventListener("mousedown", () => toggleWall(cell, r, c));
      cell.addEventListener("mouseover", () => {
        if (mouseDown) toggleWall(cell, r, c);
      });

      gridElement.appendChild(cell);

      row.push({
        row: r,
        col: c,
        isWall: false,
        element: cell,
        prev: null,
        distance: Infinity,
        g: Infinity,
        f: Infinity
      });
    }

    grid.push(row);
  }

  grid[start[0]][start[1]].element.classList.add("start");
  grid[end[0]][end[1]].element.classList.add("end");
}

createGrid();

// ------------------ WALL TOGGLE ------------------
function toggleWall(cell, r, c) {
  if ((r === start[0] && c === start[1]) ||
      (r === end[0] && c === end[1])) return;

  cell.classList.toggle("wall");
  grid[r][c].isWall = !grid[r][c].isWall;
}

// ------------------ BFS ------------------
async function runBFS() {
  clearPath();

  let startTime = performance.now();
  let visitedCount = 0;

  const queue = [];
  const visited = new Set();

  let startNode = grid[start[0]][start[1]];
  queue.push(startNode);
  visited.add(`${startNode.row}-${startNode.col}`);

  while (queue.length > 0) {
    let current = queue.shift();

    if (current.row === end[0] && current.col === end[1]) {
      let pathLength = await drawPath(current);
      updateStats("BFS", performance.now() - startTime, visitedCount, pathLength);
      return;
    }

    let neighbors = getNeighbors(current.row, current.col);

    for (let neighbor of neighbors) {
      let key = `${neighbor.row}-${neighbor.col}`;

      if (!visited.has(key) && !neighbor.isWall) {
        visited.add(key);
        neighbor.prev = current;
        queue.push(neighbor);

        neighbor.element.classList.add("visited");
        visitedCount++;
        await sleep(speed);
      }
    }
  }
}

// ------------------ DIJKSTRA ------------------
async function runDijkstra() {
  clearPath();

  let startTime = performance.now();
  let visitedCount = 0;

  let unvisited = [];

  for (let row of grid) {
    for (let cell of row) {
      cell.distance = Infinity;
      cell.prev = null;
      unvisited.push(cell);
    }
  }

  let startNode = grid[start[0]][start[1]];
  startNode.distance = 0;

  while (unvisited.length > 0) {
    unvisited.sort((a, b) => a.distance - b.distance);
    let current = unvisited.shift();

    if (current.isWall) continue;
    if (current.distance === Infinity) break;

    current.element.classList.add("visited");
    visitedCount++;
    await sleep(speed);

    if (current.row === end[0] && current.col === end[1]) {
      let pathLength = await drawPath(current);
      updateStats("Dijkstra", performance.now() - startTime, visitedCount, pathLength);
      return;
    }

    let neighbors = getNeighbors(current.row, current.col);

    for (let neighbor of neighbors) {
      let newDist = current.distance + 1;

      if (newDist < neighbor.distance) {
        neighbor.distance = newDist;
        neighbor.prev = current;
      }
    }
  }
}

// ------------------ A* ------------------
async function runAStar() {
  clearPath();

  let startTime = performance.now();
  let visitedCount = 0;

  let openSet = [];

  for (let row of grid) {
    for (let cell of row) {
      cell.g = Infinity;
      cell.f = Infinity;
      cell.prev = null;
    }
  }

  let startNode = grid[start[0]][start[1]];
  startNode.g = 0;
  startNode.f = heuristic(startNode, grid[end[0]][end[1]]);

  openSet.push(startNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    let current = openSet.shift();

    if (current.isWall) continue;

    current.element.classList.add("visited");
    visitedCount++;
    await sleep(speed);

    if (current.row === end[0] && current.col === end[1]) {
      let pathLength = await drawPath(current);
      updateStats("A*", performance.now() - startTime, visitedCount, pathLength);
      return;
    }

    let neighbors = getNeighbors(current.row, current.col);

    for (let neighbor of neighbors) {
      if (neighbor.isWall) continue;

      let tempG = current.g + 1;

      if (tempG < neighbor.g) {
        neighbor.g = tempG;
        neighbor.f = tempG + heuristic(neighbor, grid[end[0]][end[1]]);
        neighbor.prev = current;

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
}

// ------------------ HEURISTIC ------------------
function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// ------------------ MAZE ------------------
function generateMaze() {
  clearGrid();

  for (let row of grid) {
    for (let cell of row) {
      cell.isWall = true;
      cell.element.classList.add("wall");
    }
  }

  function carve(r, c) {
    let directions = shuffle([
      [0, 2],
      [2, 0],
      [0, -2],
      [-2, 0]
    ]);

    for (let [dr, dc] of directions) {
      let nr = r + dr;
      let nc = c + dc;

      if (nr > 0 && nr < rows && nc > 0 && nc < cols &&
          grid[nr][nc].isWall) {

        grid[r + dr / 2][c + dc / 2].isWall = false;
        grid[r + dr / 2][c + dc / 2].element.classList.remove("wall");

        grid[nr][nc].isWall = false;
        grid[nr][nc].element.classList.remove("wall");

        carve(nr, nc);
      }
    }
  }

  grid[1][1].isWall = false;
  grid[1][1].element.classList.remove("wall");

  carve(1, 1);

  grid[start[0]][start[1]].isWall = false;
  grid[start[0]][start[1]].element.classList.remove("wall");

  grid[end[0]][end[1]].isWall = false;
  grid[end[0]][end[1]].element.classList.remove("wall");
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// ------------------ HELPERS ------------------
function getNeighbors(r, c) {
  const directions = [[0,1],[1,0],[0,-1],[-1,0]];
  let neighbors = [];

  for (let [dr, dc] of directions) {
    let nr = r + dr;
    let nc = c + dc;

    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      neighbors.push(grid[nr][nc]);
    }
  }

  return neighbors;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ------------------ PATH ------------------
async function drawPath(node) {
  let current = node;
  let length = 0;

  while (current.prev) {
    current = current.prev;
    current.element.classList.add("path");
    length++;
    await sleep(speed);
  }

  return length;
}

// ------------------ CLEAR ------------------
function clearPath() {
  for (let row of grid) {
    for (let cell of row) {
      cell.element.classList.remove("visited", "path");
      cell.prev = null;
    }
  }
}

function clearGrid() {
  for (let row of grid) {
    for (let cell of row) {
      cell.element.classList.remove("visited", "path", "wall");
      cell.isWall = false;
      cell.prev = null;
    }
  }
}

// ------------------ STATS ------------------
function updateStats(algo, time, visited, pathLength) {
  document.getElementById("algo").innerText = algo;
  document.getElementById("time").innerText = time.toFixed(2);
  document.getElementById("visited").innerText = visited;
  document.getElementById("path").innerText = pathLength;
}