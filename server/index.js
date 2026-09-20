import express, { json, static as static_ } from "express";

import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { chatRouter } from "../routes/chat.js";
import { PORT } from "./config.js";

import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/", chatRouter);
app.use(static_(process.cwd() + "/client"));

const server = createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("client connected");

  socket.on("disconnect", () => {
    console.log("client disconnected");
  });

  socket.on("messages", (msg, user) => {
    io.emit("messages", msg, user);
  });
});

server.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`);
});

async function connection() {
  try {
    await mongoose.connect(process.env.URL);
    console.log("Connection DB success ");
  } catch (error) {
    console.error(error);
  } finally {
  }
}

connection().catch(console.error);
