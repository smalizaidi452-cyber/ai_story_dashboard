// backend/routes/users.js
import express from "express";
import db from "../db.js";
const router = express.Router();

router.post("/addUser", async (req, res) => {
  const { name, email, role } = req.body;
  await db.run("INSERT INTO users (name, email, role) VALUES (?, ?, ?)", [name, email, role]);
  res.json({ message: "User added successfully" });
});

router.get("/allUsers", async (req, res) => {
  const users = await db.all("SELECT * FROM users");
  res.json(users);
});

export default router;
