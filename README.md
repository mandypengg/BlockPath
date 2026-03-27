# Pathfinding Visualizer

An interactive, Minecraft-themed pathfinding visualizer built with vanilla HTML, CSS, and JavaScript. Watch BFS, Dijkstra's, and A* explore a grid in real time — draw walls, generate mazes, and compare how each algorithm finds its way.

Try it here! https://mandypengg.github.io/BlockPath/

---

## Features

- **Three algorithms** — Breadth-First Search, Dijkstra's, and A*
- **Interactive grid** — click or click-and-drag to place/remove walls
- **Maze generation** — recursive backtracker algorithm carves a solvable maze every time
- **Adjustable speed** — filled slider controls animation delay from slow step-through to near-instant
- **Live stats** — displays algorithm name, elapsed time, nodes visited, and path length after each run
- **Minecraft pixel aesthetic** — Press Start 2P font, earthy color palette, cobblestone walls, water-spread visited cells, gold path highlight

---

## Algorithms

| Algorithm | Guarantees Shortest Path | Weighted | Notes |
|---|---|---|---|
| BFS | ✅ (unweighted) | ❌ | Explores layer by layer |
| Dijkstra's | ✅ | ✅ | Generalizes BFS for weighted graphs |
| A* | ✅ | ✅ | Uses Manhattan distance heuristic; most efficient |

---

## Getting Started

No build tools or dependencies required.

```bash
git clone https://github.com/your-username/pathfinding-visualizer.git
cd pathfinding-visualizer
open index.html
```

Or just open `index.html` directly in any modern browser.

---

## Usage

1. **Draw walls** — click or drag across cells on the grid
2. **Generate a maze** — click ⚒ Maze for a randomly carved solvable maze
3. **Pick an algorithm** — select BFS, Dijkstra, or A* from the dropdown
4. **Run** — click ▶ Run and watch the algorithm explore
5. **Clear** — click ✕ Clear to reset everything and cancel any running animation

---

## Tech Stack
- HTML
- CSS
- JavaScript

---
