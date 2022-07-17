import mongoose from "mongoose";

const linklistSchema = new mongoose.Schema({
    title: String,
    url: String,
    img: String,
    description: String,
    genre: String,
});

export const Linklist = mongoose.model("linklist", linklistSchema);
