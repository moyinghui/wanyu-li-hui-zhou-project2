import { createContext, useContext, useEffect, useState } from "react";

const SudokuContext = createContext(null);
const STORAGE_KEY = "neo-sudoku-state-v1";

/* =========================
   Predefined solutions
   ========================= */

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

/* =========================
   Helper functions
   ========================= */

// 6x6 uses 2x3 blocks, 9x9 uses 3x3 blocks
function getBlockDimensions(size) {
  if (size === 6) {
    return { blockRows: 2, blockCols: 3 };
  }
  return { blockRows: 3, blockCols: 3 };
}

// Check if placing num at (row, col) is valid
function isSafe(board, row, col, num, size) {
  const { blockRows, blockCols } = getBlockDimensions(size);

  for (let c = 0; c < size; c++) {
    if (board[row][c] === num) return false;
  }

  for (let r = 0; r < size; r++) {
    if (board[r][col] === num) return false;
  }

  const startRow = row - (row % blockRows);
  const startCol = col - (col % blockCols);
  for (let r = startRow; r < startRow + blockRows; r++) {
    for (let c = startCol; c < startCol + blockCols; c++) {
      if (board[r][c] === num) return false;
    }
  }

  return true;
}

// Count number of solutions (used to ensure uniqueness)
function countSolutions(board, size, limit = 2) {
  let count = 0;

  function backtrack() {
    if (count >= limit) return;

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

    if (row === -1) {
      count++;
      return;
    }

    for (let num = 1; num <= size; num++) {
      if (isSafe(board, row, col, num, size)) {
        board[row][col] = num;
        backtrack();
        board[row][col] = 0;
        if (count >= limit) return;
      }
    }
  }

  backtrack();
  return count;
}

// Generate a unique puzzle from a full solution
function makeUniquePuzzleFromSolution(solution, cluesCount) {
  const size = solution.length;
  const totalCells = size * size;
  const board = clone2D(solution);

  const indices = Array.from({ length: totalCells }, (_, i) => i);
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

    const temp = clone2D(board);
    const solutions = countSolutions(temp, size, 2);

    if (solutions !== 1) {
      board[r][c] = backup;
    } else {
      removed++;
    }
  }

  return board;
}

// Compute invalid cells
function computeErrors(board, size) {
  const errors = {};
  const { blockRows, blockCols } = getBlockDimensions(size);

  const markError = (r, c) => {
    errors[`${r}-${c}`] = true;
  };

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

/* =========================
   Context Provider
   ========================= */

export function SudokuProvider({ children }) {
  const [mode, setMode] = useState(null);
  const [size, setSize] = useState(null);
  const [solutionBoard, setSolutionBoard] = useState([]);
  const [initialBoard, setInitialBoard] = useState([]);
  const [board, setBoard] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [hintCell, setHintCell] = useState(null);

  /* Load existing game from backend (Project 3) */
  function loadGameFromBackend(game) {
    if (!game || !game.board || !game.solution) return;

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    setMode(game.difficulty === "EASY" ? "easy" : "normal");
    setSize(game.board.length);
    setSolutionBoard(clone2D(game.solution));
    setInitialBoard(clone2D(game.board));
    setBoard(clone2D(game.board));
    setErrors({});
    setElapsed(0);
    setStatus("playing");
    setHintCell(null);
  }

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
  }

  function updateCell(row, col, value) {
    if (status !== "playing") return;
    if (initialBoard[row][col] !== 0) return;

    const next = clone2D(board);
    next[row][col] = value === "" ? 0 : Number(value);

    const nextErrors = computeErrors(next, size);
    setBoard(next);
    setErrors(nextErrors);

    const hasEmpty = next.some((r) => r.includes(0));
    if (!hasEmpty && Object.keys(nextErrors).length === 0) {
      setStatus("completed");
    }
  }

  function giveHint() {
    if (status !== "playing") return;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] !== 0) continue;

        const candidates = [];
        for (let v = 1; v <= size; v++) {
          const temp = clone2D(board);
          temp[r][c] = v;
          const tempErrors = computeErrors(temp, size);
          if (!tempErrors[`${r}-${c}`]) candidates.push(v);
          if (candidates.length > 1) break;
        }

        if (candidates.length === 1) {
          setHintCell(`${r}-${c}`);
          return;
        }
      }
    }
  }

  return (
    <SudokuContext.Provider
      value={{
        mode,
        size,
        solutionBoard,
        initialBoard,
        board,
        status,
        errors,
        elapsedSeconds: elapsed,
        hintCell,
        startNewGame,        // Project 2
        loadGameFromBackend, // Project 3
        resetGame,
        updateCell,
        giveHint,
      }}
    >
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
