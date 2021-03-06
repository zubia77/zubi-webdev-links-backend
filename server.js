import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Linklist } from "./models/Linklist.js";
import { User } from "./models/User.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'


dotenv.config();

// const user = {
//     id: 1,
//     username: "zubi",
//     firstName: "Zubia",
//     lastName: "Rashid",
// };

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

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = await User.findOne({ username });

    if (user === null) {
        res.status(403).send('user not found')
    } else {
        const passwordIsCorrect = await bcrypt.compare(password, user.hash)
        if (passwordIsCorrect) {
            const frontendUser= {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                accessGroups: user.accessGroups,
            };
            jwt.sign(
                {user: frontendUser },
                'secretkey',
                { expiresIn: '20s' },
                (err, token) => {
                    res.json({
                        user: frontendUser,
                        token
                    })
                }
            )
        } else {
            res.status(403).send('bad password')
        }
    }
});

app.get("/linklists", async (req, res) => {
    const linkLists = await Linklist.find();
    res.status(200).json(linkLists);
});

app.post("/linklists", async (req, res) => {
    const {title, url, description, genre} = req.body.link
    try {
        const link = await Linklist.create({title, url, description, genre})
        res.status(200).json(link)
    } catch (error) {
        res.status(400),json({error: error.message})
    }
});

app.delete('/linklists:_id', async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({error: 'No such link'})
}

    const linkList = await Linklist.findOneAndDelete({_id: id})

    if (!linkList) {
        return res.status(400).json({error: 'No such workout'})
    }

    res.status(200).json(linkList)

}
)

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
