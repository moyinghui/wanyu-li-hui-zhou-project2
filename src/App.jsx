import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import GameSelection from "./pages/GameSelection";
import Game from "./pages/Game"; // new unified game page
import Rules from "./pages/Rules";
import Scores from "./pages/Scores";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />

        {/* Game selection page */}
        <Route path="games" element={<GameSelection />} />

        {/* Unified game page */}
        <Route path="game/:id" element={<Game />} />

        <Route path="rules" element={<Rules />} />
        <Route path="scores" element={<Scores />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
    </Routes>
  );
}

export default App;
