import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Linklist } from "./models/Linklist.js";
import cors from "cors";
import jwt from "jsonwebtoken";

dotenv.config();

const user = {
    id: 1,
    username: "zubi",
    firstName: "Zubia",
    lastName: "Rashid",
};

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3060;

const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost/zubi-webdev-links";

mongoose.connect(MONGODB_URI, (err) => {
    if (err) {
        console.log({
            error: "Cannot connect to MongoDB database.",
            err: `"${err}"`,
        });
    }
});

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
};

const decodeJwt = (token) => {
    let base64Url = token.split(".")[1];
    let base64 = base64Url.replace("-", "+").replace("_", "/");
    let decodedData = JSON.parse(
        Buffer.from(base64, "base64").toString("binary")
    );
    return decodedData;
};

app.get("/", (req, res) => {
    res.send("<h1>Zubi Webdev Links</h1>");
});

app.post("/maintain-login", verifyToken, (req, res) => {
    jwt.verify(req.token, "secretkey", (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            const data = decodeJwt(req.token);
            res.json({
                user: data.user,
            });
        }
    });
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username === "zubi" && password === "123") {
        jwt.sign({ user }, "secretkey", { expiresIn: "20s" }, (err, token) => {
            res.json({
                user,
                token,
            });
        });
    } else {
        res.sendStatus(403);
    }
});

app.get("/linklists", async (req, res) => {
    const linkLists = await Linklist.find();
    res.status(200).json(linkLists);
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
