import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        Sudoku
      </Link>

      <div className="nav-links">
        <Link to="/games">Games</Link>
        <Link to="/scores">Scores</Link>

        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <span className="nav-user">Hello, {user}</span>
            <button onClick={handleLogout} className="btn-link">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
