// backend/routes/reports.js
import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = express.Router();

router.post("/generate-report", async (req, res) => {
  const { projectId, remarks } = req.body;

  try {
    const scenes = await prisma.scene.findMany({
      where: { episode: { projectId } },
    });

    const totalScenes = scenes.length;
    const completedScenes = scenes.filter(s => s.recordedDate !== null).length;
    const progressPercent = ((completedScenes / totalScenes) * 100).toFixed(1);

    const report = await prisma.report.create({
      data: {
        projectId,
        totalScenes,
        completedScenes,
        progressPercent: parseFloat(progressPercent),
        remarks,
      },
    });

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Report generation failed" });
  }
});

export default router;
