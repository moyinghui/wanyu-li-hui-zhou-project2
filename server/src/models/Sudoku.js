import mongoose from "mongoose";

const SudokuSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        difficulty: {
            type: String,
            enum: ["EASY", "NORMAL"],
            required: true,
        },
        board: {
            type: Array, // 9x9 array
            required: true,
        },
        solution: {
            type: Array,
            required: true,
        },
        createdBy: {
            type: String, // username
            required: true,
        },
        completedUsers: {
            type: [String], // usernames
            default: [],
        },
    },
    { timestamps: true }
);

export const Sudoku = mongoose.model("Sudoku", SudokuSchema);
