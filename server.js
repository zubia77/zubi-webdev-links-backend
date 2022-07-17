import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Linklist } from './models/Linklist.js'
import cors from "cors"

dotenv.config();

const app = express();
app.use(cors())
const port = process.env.PORT || 3060;

const MONGODB_URI =
    process.env.MONGODB_URI || 
    "mongodb://localhost/zubi-webdev-links";

mongoose.connect(MONGODB_URI, (err) => {
    if (err) {
        console.log({
            error: "Cannot connect to MongoDB database.",
            err: `"${err}"`,
        });
    }
});



app.get("/", (req, res) => {
    res.send("<h1>Zubi Webdev Links</h1>");
});

app.get('/linklists', async (req, res) => {
    const linkLists = await Linklist.find();
    res.status(200).json(linkLists);
})

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
