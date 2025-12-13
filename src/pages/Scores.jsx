import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Scores() {
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/highscore")
      .then((data) => {
        setUsers(data.users);
        setGames(data.games);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load scores");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading scores...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <main className="page">
      <h1 className="page-title">High Scores</h1>

      {/* User leaderboard */}
      <section>
        <h2>User Leaderboard</h2>
        {users.length === 0 ? (
          <p>No completed games yet.</p>
        ) : (
          <ol>
            {users.map((u) => (
              <li key={u.username}>
                {u.username} – {u.wins} win{u.wins > 1 ? "s" : ""}
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Game leaderboard */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Most Completed Games</h2>
        {games.length === 0 ? (
          <p>No games have been completed yet.</p>
        ) : (
          <ol>
            {games.map((g) => (
              <li key={g.gameId}>
                {g.name} – {g.completions} completion
                {g.completions > 1 ? "s" : ""}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
