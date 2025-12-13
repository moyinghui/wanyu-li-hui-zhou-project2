import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import {
    setSession,
    clearSession,
    getUsernameFromSession,
} from "../middleware/session.js";

export const userRoutes = express.Router();

/**
 * GET /api/user/isLoggedIn
 */
userRoutes.get("/isLoggedIn", (req, res) => {
    const username = getUsernameFromSession(req);
    if (!username) {
        return res.status(401).json({ error: "Not logged in" });
    }
    res.json({ username });
});

/**
 * POST /api/user/register
 */
userRoutes.post("/register", async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const exists = await User.findOne({ username });
    if (exists) {
        return res.status(409).json({ error: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username, passwordHash });

    setSession(res, username);
    res.json({ username });
});

/**
 * POST /api/user/login
 */
userRoutes.post("/login", async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    setSession(res, username);
    res.json({ username });
});

/**
 * POST /api/user/logout
 */
userRoutes.post("/logout", (req, res) => {
    clearSession(req, res);
    res.json({ ok: true });
});
