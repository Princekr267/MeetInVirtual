// Load environment variables FIRST (before any other imports that use them)
import 'dotenv/config';

import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

import {connectToSocket} from "./controllers/socketManager.js";

import userRoutes from "./routes/users.routes.js";

import passport from "./config/passport.js";


const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 3000));
app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));

// Initialize passport BEFORE routes
app.use(passport.initialize());

app.use("/api/v1/users", userRoutes);

app.get("/home", (req, res) => {
    return res.json({"Page" : "home"});
})

const start = async () => {
    const connectionDB = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB is connected to ${connectionDB.connection.host}`)
    server.listen(app.get("port"), ()=>{
        console.log("Server is listening to port: ", 3000);
    })
}
start();