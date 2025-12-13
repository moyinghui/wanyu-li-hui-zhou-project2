import express from "express";
import Game from "../models/Game.js";

const router = express.Router();

/**
 * GET /api/highscore
 * Returns:
 * {
 *   users: [{ username, wins }],
 *   games: [{ gameId, name, completions }]
 * }
 */
router.get("/", async (req, res) => {
    try {
        const games = await Game.find({ completedBy: { $exists: true, $ne: [] } });

        // ----- User leaderboard -----
        const userWins = {};

        games.forEach((game) => {
            game.completedBy.forEach((username) => {
                userWins[username] = (userWins[username] || 0) + 1;
            });
        });

        const users = Object.entries(userWins)
            .map(([username, wins]) => ({ username, wins }))
            .sort((a, b) => b.wins - a.wins || a.username.localeCompare(b.username));

        // ----- Game leaderboard -----
        const gameStats = games
            .map((game) => ({
                gameId: game._id,
                name: game.name,
                completions: game.completedBy.length,
            }))
            .sort((a, b) => b.completions - a.completions);

        res.json({ users, games: gameStats });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load high scores" });
    }
});

export default router;
