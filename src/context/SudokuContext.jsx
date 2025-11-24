import { createContext, useContext, useEffect, useState } from "react";

const SudokuContext = createContext(null);
const STORAGE_KEY = "neo-sudoku-state-v1";

// Complete solution for 6x6
const SOLUTION_6 = [
  [1, 2, 3, 4, 5, 6],
  [4, 5, 6, 1, 2, 3],
  [2, 3, 4, 5, 6, 1],
  [5, 6, 1, 2, 3, 4],
  [3, 4, 5, 6, 1, 2],
  [6, 1, 2, 3, 4, 5],
];

// Complete solution for 9x9
const SOLUTION_9 = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [4, 5, 6, 7, 8, 9, 1, 2, 3],
  [7, 8, 9, 1, 2, 3, 4, 5, 6],
  [2, 3, 4, 5, 6, 7, 8, 9, 1],
  [5, 6, 7, 8, 9, 1, 2, 3, 4],
  [8, 9, 1, 2, 3, 4, 5, 6, 7],
  [3, 4, 5, 6, 7, 8, 9, 1, 2],
  [6, 7, 8, 9, 1, 2, 3, 4, 5],
  [9, 1, 2, 3, 4, 5, 6, 7, 8],
];

function clone2D(array) {
  return array.map((row) => [...row]);
}

// 6x6 uses 2x3 blocks, 9x9 uses 3x3 blocks
function getBlockDimensions(size) {
  if (size === 6) {
    return { blockRows: 2, blockCols: 3 };
  }
  return { blockRows: 3, blockCols: 3 };
}

// Check if placing num at (row, col) satisfies row, column, and block constraints
function isSafe(board, row, col, num, size) {
  const { blockRows, blockCols } = getBlockDimensions(size);

  // Row
  for (let c = 0; c < size; c++) {
    if (board[row][c] === num) return false;
  }

  // Column
  for (let r = 0; r < size; r++) {
    if (board[r][col] === num) return false;
  }

  // Block
  const startRow = row - (row % blockRows);
  const startCol = col - (col % blockCols);
  for (let r = startRow; r < startRow + blockRows; r++) {
    for (let c = startCol; c < startCol + blockCols; c++) {
      if (board[r][c] === num) return false;
    }
  }

  return true;
}

// Use backtracking to count how many solutions the current board has (up to a limit)
function countSolutions(board, size, limit = 2) {
  let count = 0;

  function backtrack() {
    if (count >= limit) return;

    // Find the first empty cell
    let row = -1;
    let col = -1;
    outer: for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === 0) {
          row = r;
          col = c;
          break outer;
        }
      }
    }

    // No empty cells → found a complete solution
    if (row === -1) {
      count++;
      return;
    }

    // Try placing 1..size
    for (let num = 1; num <= size; num++) {
      if (isSafe(board, row, col, num, size)) {
        board[row][col] = num;
        backtrack();
        board[row][col] = 0;
        if (count >= limit) return; // Early exit
      }
    }
  }

  backtrack();
  return count;
}


// Use backtracking to "dig holes" from a complete solution, ensuring uniqueness after each removal
function makeUniquePuzzleFromSolution(solution, cluesCount) {
  const size = solution.length;
  const totalCells = size * size;

  // Start from the complete solution
  const board = clone2D(solution);

  const indices = Array.from({ length: totalCells }, (_, i) => i);
  // Fisher–Yates shuffle, shuffle the order of digging holes
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const maxToRemove = totalCells - cluesCount;
  let removed = 0;

  for (const idx of indices) {
    if (removed >= maxToRemove) break;

    const r = Math.floor(idx / size);
    const c = idx % size;

    if (board[r][c] === 0) continue;

    const backup = board[r][c];
    board[r][c] = 0;

    // Clone the current board and count the number of solutions
    const temp = clone2D(board);
    const solutions = countSolutions(temp, size, 2);

    // If not unique (solutions ≠ 1), revert this hole digging
    if (solutions !== 1) {
      board[r][c] = backup;
    } else {
      removed++;
    }
  }

  return board;
}


// Calculate all cells that violate rules: return a map { "r-c": true }
function computeErrors(board, size) {
  const errors = {};
  const { blockRows, blockCols } = getBlockDimensions(size);

  const markError = (r, c) => {
    errors[`${r}-${c}`] = true;
  };

  // rows
  for (let r = 0; r < size; r++) {
    const seen = {};
    for (let c = 0; c < size; c++) {
      const v = board[r][c];
      if (v === 0) continue;
      if (!seen[v]) seen[v] = [];
      seen[v].push({ r, c });
    }
    Object.values(seen).forEach((cells) => {
      if (cells.length > 1) cells.forEach(({ r, c }) => markError(r, c));
    });
  }

  // cols
  for (let c = 0; c < size; c++) {
    const seen = {};
    for (let r = 0; r < size; r++) {
      const v = board[r][c];
      if (v === 0) continue;
      if (!seen[v]) seen[v] = [];
      seen[v].push({ r, c });
    }
    Object.values(seen).forEach((cells) => {
      if (cells.length > 1) cells.forEach(({ r, c }) => markError(r, c));
    });
  }

  // blocks
  for (let br = 0; br < size; br += blockRows) {
    for (let bc = 0; bc < size; bc += blockCols) {
      const seen = {};
      for (let r = br; r < br + blockRows; r++) {
        for (let c = bc; c < bc + blockCols; c++) {
          const v = board[r][c];
          if (v === 0) continue;
          if (!seen[v]) seen[v] = [];
          seen[v].push({ r, c });
        }
      }
      Object.values(seen).forEach((cells) => {
        if (cells.length > 1) cells.forEach(({ r, c }) => markError(r, c));
      });
    }
  }

  return errors;
}

export function SudokuProvider({ children }) {
  const [mode, setMode] = useState(null); // 'easy' | 'normal'
  const [size, setSize] = useState(null); // 6 | 9
  const [solutionBoard, setSolutionBoard] = useState([]);
  const [initialBoard, setInitialBoard] = useState([]);
  const [board, setBoard] = useState([]);
  const [status, setStatus] = useState("idle"); // 'idle' | 'playing' | 'completed'
  const [errors, setErrors] = useState({}); // { "r-c": true }
  const [elapsed, setElapsed] = useState(0); // seconds
  const [hintCell, setHintCell] = useState(null); // "r-c" or null

  // Initial load: if there is a saved game in localStorage, restore it
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const saved = JSON.parse(raw);
      if (!saved || !saved.board || !saved.initialBoard) return;

      setMode(saved.mode ?? null);
      setSize(saved.size ?? null);
      setSolutionBoard(saved.solutionBoard ?? []);
      setInitialBoard(saved.initialBoard ?? []);
      setBoard(saved.board ?? []);
      setErrors(saved.errors ?? {});
      setElapsed(saved.elapsed ?? 0);
      setStatus(saved.status ?? "playing");
      setHintCell(saved.hintCell ?? null);
    } catch (e) {
      console.error("Failed to parse saved sudoku state", e);
    }
  }, []);

  // Timer: increment only when status is "playing"
  useEffect(() => {
    if (status !== "playing") {
      return;
    }

    const id = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [status]);

  // Save the game to localStorage whenever the state changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!board.length) return;
    if (status === "idle") return;

    if (status === "completed") {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const payload = {
      mode,
      size,
      solutionBoard,
      initialBoard,
      board,
      errors,
      elapsed,
      status,
      hintCell,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to save sudoku state", e);
    }
  }, [
    mode,
    size,
    solutionBoard,
    initialBoard,
    board,
    errors,
    elapsed,
    status,
    hintCell,
  ]);

  function startNewGame(newMode) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    const isEasy = newMode === "easy";
    const solution = isEasy ? SOLUTION_6 : SOLUTION_9;
    const clues = isEasy ? 18 : 30;

    const puzzle = makeUniquePuzzleFromSolution(solution, clues);

    setMode(newMode);
    setSize(isEasy ? 6 : 9);
    setSolutionBoard(clone2D(solution));
    setInitialBoard(clone2D(puzzle));
    setBoard(clone2D(puzzle));
    setErrors({});
    setElapsed(0);
    setStatus("playing");
    setHintCell(null);
  }

  function resetGame() {
    if (!initialBoard.length) return;
    setBoard(clone2D(initialBoard));
    setErrors({});
    setElapsed(0);
    setStatus("playing");
    setHintCell(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  function updateCell(row, col, value) {
    if (status !== "playing") return;
    if (!board.length) return;

    // Cannot change initial cells
    if (initialBoard[row][col] !== 0) return;

    let num;
    if (value === "") {
      num = 0;
    } else {
      num = Number(value);
      if (!Number.isInteger(num)) return;
      if (num < 1 || num > size) return;
    }

    const next = board.map((r) => [...r]);
    next[row][col] = num;

    const nextErrors = computeErrors(next, size);
    setBoard(next);
    setErrors(nextErrors);
    setHintCell(null); // Cancel hint highlight when the user starts typing

    const hasEmpty = next.some((r) => r.includes(0));
    const hasErrors = Object.keys(nextErrors).length > 0;

    if (!hasEmpty && !hasErrors) {
      setStatus("completed");
    } else {
      setStatus("playing");
    }
  }

  // Hint: find a cell with a unique valid candidate number
  function giveHint() {
    if (status !== "playing") return;
    if (!board.length) return;
    if (!size) return;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] !== 0) continue;

        const candidates = [];

        for (let v = 1; v <= size; v++) {
          const temp = board.map((row) => [...row]);
          temp[r][c] = v;
          const tempErrors = computeErrors(temp, size);

          // If this placement does not cause an error in this cell, consider v a valid candidate
          if (!tempErrors[`${r}-${c}`]) {
            candidates.push(v);
          }

          if (candidates.length > 1) break; // More than one candidate, break out
        }

        if (candidates.length === 1) {
          setHintCell(`${r}-${c}`);
          return;
        }
      }
    }

    // If no cell with a unique candidate is found, do nothing
  }

  const value = {
    mode,
    size,
    solutionBoard,
    initialBoard,
    board,
    status,
    errors,
    elapsedSeconds: elapsed,
    hintCell,
    startNewGame,
    resetGame,
    updateCell,
    giveHint,
  };

  return (
    <SudokuContext.Provider value={value}>
      {children}
    </SudokuContext.Provider>
  );
}

export function useSudoku() {
  const ctx = useContext(SudokuContext);
  if (!ctx) {
    throw new Error("useSudoku must be used inside SudokuProvider");
  }
  return ctx;
}
