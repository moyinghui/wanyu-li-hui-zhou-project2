import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    // Unique human-readable game name (e.g., "Coconut Red House")
    name: {
        type: String,
        required: true,
        unique: true,
    },

    // Game difficulty
    difficulty: {
        type: String,
        enum: ["EASY", "NORMAL"],
        required: true,
    },

    // Initial puzzle board (0 represents empty cells)
    board: {
        type: Array,
        required: true,
    },

    // Full solution board
    solution: {
        type: Array,
        required: true,
    },

    // Username of the creator
    createdBy: {
        type: String,
        required: true,
    },

    // Creation timestamp
    createdAt: {
        type: Date,
        default: Date.now,
    },

    // List of usernames who completed this game
    // Used for High Scores
    completedBy: {
        type: [String],
        default: [],
    },
});

export default mongoose.model("Game", gameSchema);
