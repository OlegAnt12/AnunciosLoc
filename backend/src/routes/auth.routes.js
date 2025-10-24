import express from "express";
import { registerUser, loginUser, logoutSession } from "../auth.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "username e password obrigatórios" });
    const user = await registerUser(username, password);
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "username já existe" });
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password, device_id } = req.body;
    const session = await loginUser(username, password, device_id);
    if (!session) return res.status(401).json({ error: "Credenciais inválidas" });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const { session_id } = req.body;
    await logoutSession(session_id);
    res.json({ message: "Logout OK" });
  } catch (err) {
    next(err);
  }
});

export default router;
