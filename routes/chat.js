import { Router } from "express";
import jwt from "jsonwebtoken";
import bcryp from "bcrypt";
import User from "../models/userModel.js";
import { SALT_ROUNDS } from "../server/config.js";

import dotenv from "dotenv";
dotenv.config();

export const chatRouter = Router();

chatRouter.use((req, res, next) => {
  const token = req.cookies.acces_token;

  req.session = { user: null };
  try {
    const data = jwt.verify(token, process.env.SECRET_JWT_KEY);
    req.session.user = data;
  } catch (error) {
    req.session.user = null;
  }

  next();
});

chatRouter.get("/", (req, res) => {
  const { user } = req.session;

  if (user != null) {
    return res.sendFile(process.cwd() + "/client/chat.html");
  }

  return res.sendFile(process.cwd() + "/client/index.html");
});

chatRouter.post("/sing-up", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  const showUser = await User.findOne({ user: username });

  if (username == "" || password == "" || confirmPassword == "")
    return res.status(401).json({ messages: "vacio" });

  if (password !== confirmPassword)
    return res.status(401).json({ messages: "password" });

  if (showUser) return res.status(401).json({ status: true });

  const hashPassword = await bcryp.hash(password, SALT_ROUNDS);

  const newUser = new User({ user: username, password: hashPassword });

  const savedUser = await newUser.save();

  return res.status(200).json({ succes: "200" });
});

chatRouter.post("/sing-in", async (req, res) => {
  const { username, password } = req.body;

  const showUser = await User.findOne({ user: username });

  const token = jwt.sign(
    { username: showUser.user },
    process.env.SECRET_JWT_KEY,
    {
      expiresIn: "1h",
    },
  );

  if (!showUser)
    return res.status(401).json({ messages: "El usuario no existe" });

  const isValid = await bcryp.compare(password, showUser.password);

  if (!isValid) return res.status(401).json({ messages: "error" });

  return res
    .cookie("acces_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60,
    })
    .status(200)
    .json({ succes: "200", url: "/chat.html" });
});

chatRouter.get("/chat.html", (req, res) => {
  const { user } = req.session;

  if (!user) return res.sendFile(process.cwd() + "/client/index.html");

  return res.sendFile(process.cwd() + "/client/chat.html");
});

chatRouter.get("/user-session", (req, res) => {
  const token = req.cookies.acces_token;

  try {
    const data = jwt.verify(token, process.env.SECRET_JWT_KEY);
    return res.status(200).json({ username: data.username });
  } catch (error) {
    res.status(403);
    res.sendFile(process.cwd() + "/client/index.html");
  }
});

chatRouter.get("/logout", (req, res) => {
  try {
    res.clearCookie("acces_token").status(200).json({ url: "/index.html" });
  } catch (error) {
    console.error(error);
  }
});
