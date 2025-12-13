import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        wins: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
