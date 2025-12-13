import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

import { userRoutes } from "./routes/userRoutes.js";
import { sudokuRoutes } from "./routes/sudokuRoutes.js";
import highscoreRoutes from "./routes/highscoreRoutes.js";


dotenv.config();

const app = express();

// -------- middleware --------
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
    cors({
        origin: "http://localhost:5173", // Vite
        credentials: true,
    })
);

// -------- test route --------
app.get("/api/health", (req, res) => {
    res.json({ ok: true });
});

// -------- routes --------
app.use("/api/user", userRoutes);
app.use("/api/sudoku", sudokuRoutes);
app.use("/api/highscore", highscoreRoutes);

// -------- start server --------
const PORT = process.env.PORT || 5050;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Failed to start server", err);
        process.exit(1);
    });
