// ============================================================
// ✅ routes/projects.js — FINAL VERSION (with Migration)
// ============================================================

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/project.model");
const { Schedule } = require("../models/schedule.model");
const Scene = require("../models/scene.model");

// ✅ Helper to safely convert to ObjectId
const toObjectId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) return new mongoose.Types.ObjectId(id);
  return null;
};

// ============================================================
// ✅ GET: All Projects
// ============================================================
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({})
      .select("_id projectName createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    console.error("❌ Error fetching all projects:", error);
    res.status(500).json({ message: "Server error while retrieving project list." });
  }
});
// ============================================================
// ✅ MIGRATION ROUTE: Move scenes from projects.breakdown.scenes → scenes collection
// ============================================================
router.get("/migrate-scenes", async (req, res) => {
  try {
    const projects = await Project.find({ "breakdown.scenes": { $exists: true, $ne: [] } });

    if (!projects.length) {
      return res.status(404).json({ message: "❌ No projects found with scenes." });
    }

    let totalInserted = 0;

    for (const project of projects) {
      const projectId = project._id;
      const scenes = project.breakdown?.scenes || [];

      for (const scene of scenes) {
        const exists = await Scene.findOne({ projectId, sceneNumber: scene.sceneNumber });
        if (exists) continue; // skip duplicates

        await Scene.create({
          projectId,
          episodeNumber: scene.episodeNumber || "1",
          sceneNumber: scene.sceneNumber,
          time: scene.time || scene.TIME || "",
          location: scene.location || scene.LOCATION || "",
          subLocation: scene.subLocation || scene.SUB_LOCATION || "",
          characters: scene.characters || scene.CHARACTERS || [],
          props: scene.props || scene.PROPS || [],
          synopsis: scene.synopsis || scene.SYNOPSIS || "",
          phoneTalk: scene.phoneTalk || false,
          scheduledDate: "",
          recordedDate: "",
        });
        totalInserted++;
      }
    }

    res.status(200).json({
      message: `✅ Migration complete — ${totalInserted} scenes inserted successfully.`,
    });
  } catch (err) {
    console.error("❌ Migration error:", err);
    res.status(500).json({ message: "Server error during scene migration." });
  }
});
// ============================================================
// ✅ GET: Single Project by ID
// ============================================================
router.get("/:id", async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Requested project not found." });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error("❌ Error fetching single project:", error);
    res.status(400).json({ message: "Invalid Project ID or server error." });
  }
});

// ============================================================
// ✅ GET: All scenes of a project (for schedule page)
// ============================================================
router.get("/:projectId/scenes", async (req, res) => {
  try {
    const { projectId } = req.params;
    const scenes = await Scene.find({ projectId });
    res.status(200).json(scenes);
  } catch (err) {
    console.error("❌ Error fetching scenes:", err);
    res.status(500).send("Server error");
  }
});

// ============================================================
// ✅ POST: Save schedule data to DB
// ============================================================
router.post("/save", async (req, res) => {
  try {
    const { projectId, days } = req.body;
    console.log("📦 Saving schedule for project:", projectId);

    if (!projectId || !days) {
      return res.status(400).json({ message: "Missing projectId or days data" });
    }

    const objId = toObjectId(projectId);
    if (!objId) return res.status(400).json({ message: "Invalid project ID format" });

    let schedule = await Schedule.findOne({ projectId: objId });

    if (!schedule) {
      schedule = new Schedule({ projectId: objId, days });
    } else {
      schedule.days = days;
    }

    await schedule.save();
    console.log("✅ Schedule saved successfully to DB");
    res.status(200).json({ success: true, message: "Schedule saved successfully to DB" });
  } catch (error) {
    console.error("❌ Error saving schedule:", error);
    res.status(500).json({ success: false, message: "Server error while saving schedule" });
  }
});

// ============================================================
// ✅ PUT: Update project schedule data
// ============================================================
router.put("/:projectId/schedule", async (req, res) => {
  const { projectId } = req.params;
  const { schedule } = req.body;

  console.log(`📡 PUT /${projectId}/schedule route hit - saving schedule...`);

  if (!schedule || !schedule.shootingDays || !schedule.unscheduledScenes) {
    return res.status(400).json({ message: "Invalid schedule data provided." });
  }

  try {
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { scheduleData: schedule },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found for scheduling update." });
    }

    res.status(200).json({
      message: "Shooting schedule updated successfully.",
      project: {
        projectId: updatedProject._id,
        projectName: updatedProject.projectName,
      },
    });
  } catch (error) {
    console.error("❌ Error saving project schedule:", error);
    res.status(500).json({ message: "Server error while saving the schedule.", details: error.message });
  }
});

// ============================================================
// ✅ DELETE: Remove project
// ============================================================
router.delete("/:id", async (req, res) => {
  try {
    const projectId = req.params.id;
    const deletedProject = await Project.findByIdAndDelete(projectId);
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found for deletion." });
    }
    res.status(200).json({ message: "Project deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting project:", error);
    res.status(400).json({ message: "Error deleting project." });
  }
});

// ============================================================
// ✅ Add More Episodes API
// ============================================================
router.post("/episodes/add", async (req, res) => {
  try {
    const { projectId, episodeNumber, title, description } = req.body;

    if (!projectId || !episodeNumber || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.episodes.push({
      episodeNumber,
      title,
      description,
      createdAt: new Date(),
    });

    await project.save();
    res.status(200).json({ message: "Episode added successfully", project });
  } catch (error) {
    console.error("❌ Error adding episode:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================================================
// ✅ TEMP: Add Dummy Scenes (for testing schedule frontend)
// ============================================================
router.get("/:projectId/scenes/add", async (req, res) => {
  try {
    const { projectId } = req.params;

    const dummyScenes = [
      {
        projectId,
        episodeNumber: "1",
        sceneNumber: "1",
        time: "Morning",
        location: "Malik Mansion",
        subLocation: "Library",
        characters: ["Ahmed", "Saba"],
        props: ["Paper", "Pen"],
        synopsis: "Ahmed opens a paper revealing Malik Industries’ secret contract.",
        phoneTalk: false,
      },
      {
        projectId,
        episodeNumber: "1",
        sceneNumber: "2",
        time: "Evening",
        location: "Malik Mansion",
        subLocation: "Hall",
        characters: ["Ahmed", "Raza"],
        props: ["File"],
        synopsis: "Raza confronts Ahmed about the secret deal.",
        phoneTalk: false,
      },
    ];

    await Scene.insertMany(dummyScenes);
    res.status(200).json({ message: "✅ Dummy scenes added successfully!" });
  } catch (error) {
    console.error("❌ Error adding dummy scenes:", error);
    res.status(500).json({ message: "Server error while adding dummy scenes." });
  }
});

module.exports = router;
