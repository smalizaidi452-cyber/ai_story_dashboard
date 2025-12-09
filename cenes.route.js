import express from "express";
import Scene from "../models/scene.model.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const newScene = new Scene(req.body);
    const saved = await newScene.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  const scenes = await Scene.find();
  res.json(scenes);
});

export default router;
