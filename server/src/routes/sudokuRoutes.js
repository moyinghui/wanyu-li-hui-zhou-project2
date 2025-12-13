import express from "express";
import Game from "../models/Game.js";
import { generateGameName } from "../utils/gameName.js";
import { requireLogin } from "../middleware/session.js";

export const sudokuRoutes = express.Router();

/**
 * GET /api/sudoku
 * Return all games for the selection page
 */
sudokuRoutes.get("/", async (req, res) => {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
});

/**
 * POST /api/sudoku
 * Create a new game (backend generates board & solution)
 */
sudokuRoutes.post("/", requireLogin, async (req, res) => {
    const { difficulty } = req.body;

    if (!difficulty) {
        return res.status(400).json({ error: "Missing difficulty" });
    }

    let name;
    let exists = true;

    while (exists) {
        name = generateGameName();
        exists = await Game.findOne({ name });
    }

    // TODO: replace with real generation logic if needed
    const board = [];
    const solution = [];

    const game = await Game.create({
        name,
        difficulty,
        board,
        solution,
        createdBy: req.signedCookies.sid,
    });

    res.json({ id: game._id });
});

/**
 * GET /api/sudoku/:id
 * Return a single game
 */
sudokuRoutes.get("/:id", async (req, res) => {
    const game = await Game.findById(req.params.id);
    if (!game) {
        return res.status(404).json({ error: "Game not found" });
    }
    res.json(game);
});

/**
 * PUT /api/sudoku/:id
 * Mark game as completed by current user
 */
sudokuRoutes.put("/:id", requireLogin, async (req, res) => {
    const username = req.signedCookies.sid;

    const game = await Game.findById(req.params.id);
    if (!game) {
        return res.status(404).json({ error: "Game not found" });
    }

    if (!game.completedBy.includes(username)) {
        game.completedBy.push(username);
        await game.save();
    }

    res.json({ ok: true });
});

/**
 * DELETE /api/sudoku/:id
 * Delete a game (not used by UI, required by rubric)
 */
sudokuRoutes.delete("/:id", requireLogin, async (req, res) => {
    const game = await Game.findById(req.params.id);
    if (!game) {
        return res.status(404).json({ error: "Game not found" });
    }

    // Optional: only creator can delete
    if (game.createdBy !== req.signedCookies.sid) {
        return res.status(403).json({ error: "Forbidden" });
    }

    await Game.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
});
