import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSudoku } from "../context/SudokuContext";
import SudokuBoard from "../components/SudokuBoard";
import Timer from "../components/Timer";
import { apiFetch } from "../api";

export default function Game() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    loadGameFromBackend,
    resetGame,
    giveHint,
    board,
    status,
  } = useSudoku();

  // Load game data from backend when page loads
  useEffect(() => {
    apiFetch(`/api/sudoku/${id}`)
      .then((game) => {
        loadGameFromBackend(game);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, loadGameFromBackend]);

  // Notify backend when the game is completed
  useEffect(() => {
    if (status === "completed") {
      apiFetch(`/api/sudoku/${id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: true }),
      }).catch(() => {});
    }
  }, [status, id]);

  if (loading) return <p>Loading game...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <main className="page">
      <h1 className="page-title">Sudoku Game</h1>
      <Timer />

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <button
          className="btn-secondary"
          onClick={resetGame}
          disabled={!board.length}
        >
          Reset
        </button>
        <button
          className="btn-secondary"
          onClick={giveHint}
          disabled={!board.length || status !== "playing"}
        >
          Hint
        </button>
      </div>

      {status === "completed" && (
        <p className="status-message success">
          🎉 Congratulations! You solved the puzzle.
        </p>
      )}

      {board && board.length ? (
        <SudokuBoard />
      ) : (
        <p>Loading board...</p>
      )}
    </main>
  );
}
