// backend/routes/scenes.js
const express = require("express");
const Scene = require("../models/scene.model");

const router = express.Router();

// ✅ Save scenes
router.post("/save-scenes", async (req, res) => {
  try {
    const { projectId, scenes } = req.body;

    if (!projectId || !scenes || scenes.length === 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const createdScenes = [];

    for (const s of scenes) {
      const newScene = new Scene({
        projectId,
        episodeNumber: s.episodeNumber || "",
        sceneNumber: s.sceneNumber || "",
        time: s.time || "",
        location: s.location || "",
        subLocation: s.subLocation || "",
        characters: s.characters || [],
        props: s.props || [],
        synopsis: s.synopsis || "",
        phoneTalk: s.phoneTalk || false,
        scheduledDate: s.scheduledDate || "",
        recordedDate: s.recordedDate || "",
      });

      const saved = await newScene.save();
      createdScenes.push(saved);
    }

    res.status(201).json({
      message: "Scenes saved successfully",
      count: createdScenes.length,
      data: createdScenes,
    });
  } catch (err) {
    console.error("❌ Error saving scenes:", err);
    res.status(500).json({ error: "Error saving scenes" });
  }
});

// ✅ Fetch scenes by project
router.get("/:projectId/scenes", async (req, res) => {
  try {
    const { projectId } = req.params;
    const scenes = await Scene.find({ projectId });
    res.status(200).json(scenes);
  } catch (err) {
    console.error("❌ Error fetching scenes:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
