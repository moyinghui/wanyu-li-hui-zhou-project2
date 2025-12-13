import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { useAuth } from "../context/AuthContext";

export default function GameSelection() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch all existing games when the page loads
  useEffect(() => {
    apiFetch("/api/sudoku")
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load games");
        setLoading(false);
      });
  }, []);

  // Create a new game and redirect to /game/:id
  async function createGame(difficulty) {
    setError("");
    try {
      const res = await apiFetch("/api/sudoku", {
        method: "POST",
        body: JSON.stringify({ difficulty }),
      });

      navigate(`/game/${res.id}`);
    } catch (err) {
      setError(err.message || "Failed to create game");
    }
  }

  return (
    <main className="page">
      <h1 className="page-title">Select a Game</h1>

      {/* Action buttons */}
      <div className="game-actions" style={{ marginBottom: "1rem" }}>
        <button onClick={() => createGame("EASY")} disabled={!user}>
          Create Easy Game
        </button>
        <button onClick={() => createGame("NORMAL")} disabled={!user}>
          Create Normal Game
        </button>

        {!user && (
          <p style={{ color: "gray", marginTop: "0.5rem" }}>
            Please log in to create a new game.
          </p>
        )}
      </div>

      {/* Game list */}
      {loading ? (
        <p>Loading games...</p>
      ) : (
        <ul className="game-list">
          {games.length === 0 && <li>No games created yet.</li>}

          {games.map((game) => (
            <li key={game._id}>
              <Link to={`/game/${game._id}`}>
                {game.name} – {game.difficulty} – by {game.createdBy} –{" "}
                {new Date(game.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
