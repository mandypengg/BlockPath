# Pathfinding Visualizer

An interactive, Minecraft-themed pathfinding visualizer built with vanilla HTML, CSS, and JavaScript. Watch BFS, Dijkstra's, and A* explore a grid in real time — draw walls, generate mazes, and compare how each algorithm finds its way.

![Grid with Minecraft theme showing BFS traversal](preview.png)

---

## Features

- **Three algorithms** — Breadth-First Search, Dijkstra's, and A*
- **Interactive grid** — click or click-and-drag to place/remove walls
- **Maze generation** — recursive backtracker algorithm carves a solvable maze every time
- **Adjustable speed** — filled slider controls animation delay from slow step-through to near-instant
- **Live stats** — displays algorithm name, elapsed time, nodes visited, and path length after each run
- **Instant cancel** — hitting Clear mid-run stops the algorithm immediately; no ghost animations
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

## Project Structure

```
pathfinding-visualizer/
├── index.html   # Markup and layout
├── style.css    # Minecraft-themed styling, animations, slider fill
└── script.js    # Grid logic, BFS, Dijkstra, A*, maze generation
```

---

## Technical Highlights

- **Run cancellation** via an incrementing `currentRunId` token checked at every `await` — eliminates async race conditions between runs
- **Recursive backtracker maze** seeded from odd-indexed start/end coordinates to guarantee full connectivity
- **Fisher-Yates shuffle** for unbiased maze direction randomization
- **CSS `linear-gradient` fill** on the range slider driven by a `--fill` CSS custom property updated on each `input` event
- **Zero dependencies** — pure vanilla JS, no frameworks or build steps

---
