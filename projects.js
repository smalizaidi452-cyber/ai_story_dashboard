const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/project.model");
const { Schedule } = require("../models/schedule.model");
const Scene = require("../models/scene.model");

// Helper for error handling
const asyncMiddleware = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// -------------------------------------------------------------
// HELPER FUNCTION: Migration
// -------------------------------------------------------------
async function runMigrationForProject(projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
        throw new Error('Project not found for migration.');
    }

    if (project.scenes && project.scenes.length > 0) {
        console.log(`[Migration] Starting scene migration for project ${projectId}...`);
        
        const bulkOps = project.scenes.map(oldScene => {
            // Check if scene already exists in the Scene collection (using the project's internal ID)
            const sceneId = oldScene._id;
            
            // Map old scene data to new Scene model format
            const sceneData = {
                ...oldScene.toObject(),
                _id: sceneId, // Preserve original ID if needed, or let Mongoose handle it
                projectId: projectId,
                // Add any necessary normalization here if needed
            };

            return {
                updateOne: {
                    filter: { _id: sceneId, projectId: projectId },
                    update: { $set: sceneData },
                    upsert: true 
                }
            };
        });

        if (bulkOps.length > 0) {
            await Scene.bulkWrite(bulkOps);
        }

        // Clear the old 'scenes' array from the Project model after successful migration
        await Project.updateOne({ _id: projectId }, { $unset: { scenes: "" } });
        console.log(`[Migration] Completed scene migration. ${bulkOps.length} scenes processed.`);
    }
}


// -------------------------------------------------------------
// 0. NEW: GET All Projects List
//    Path: /api/projects/
// -------------------------------------------------------------
router.get('/', asyncMiddleware(async (req, res) => {
    // ✅ FIX: 'name' ke bajaye 'projectName' field bhi select karein.
    const projects = await Project.find({}).select('projectName name status creationDate').lean();
    res.json(projects || []);
}));

// -------------------------------------------------------------
// 1. GET Single Project Data (For initial schedule load)
//    Path: /api/projects/:projectId
// -------------------------------------------------------------
router.get('/:projectId', asyncMiddleware(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).lean();
    
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    // Return project details including saved scheduleData
    res.json(project);
}));

// -------------------------------------------------------------
// 2. GET Scenes for Scheduling (Crucial for frontend)
//    Path: /api/projects/:projectId/scenes
// -------------------------------------------------------------
router.get('/:projectId/scenes', asyncMiddleware(async (req, res) => {
    const { projectId } = req.params;

    // 🚨 Run migration first to ensure Scene collection is populated
    try {
        await runMigrationForProject(projectId);
    } catch (error) {
        console.error("Migration/Scene prep failed for project:", projectId, error);
        // Continue even if migration fails
    }

    // Fetch all scenes associated with this project from the Scene model
    const scenes = await Scene.find({ projectId: projectId }).lean();
    
    res.json(scenes || []); 
}));


// -------------------------------------------------------------
// 3. POST Save Schedule (Used by the frontend's saveSchedule function)
//    Path: /api/save
// -------------------------------------------------------------
router.post('/save', asyncMiddleware(async (req, res) => {
    const { projectId, days } = req.body;
    
    if (!projectId || !days) {
        return res.status(400).json({ message: 'Missing projectId or schedule data (days)' });
    }

    // Prepare the schedule data structure to be saved in the Project model
    const scheduleData = {
        lastUpdated: new Date(),
        days: days.map(day => ({
            id: day.id,
            name: day.name,
            dayNumber: day.dayNumber,
            date: day.date,
            // Only save essential scene identifiers/data
            scenes: day.scenes.map(s => ({
                id: s.id, // Only scene ID is saved in schedule
            })),
        })),
    };

    // Update the Project document with the new schedule data
    const updatedProject = await Project.findByIdAndUpdate(
        projectId, 
        { $set: { scheduleData: scheduleData } },
        { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedProject) {
        return res.status(404).json({ message: 'Project not found for saving schedule' });
    }

    res.status(200).json({ 
        message: 'Schedule saved successfully', 
        projectId: updatedProject._id, 
        lastUpdated: scheduleData.lastUpdated 
    });
}));


// -------------------------------------------------------------
// 4. PUT Update Project Details and Sync Schedule (FIXED)
//    Path: /api/projects/:projectId
// -------------------------------------------------------------
router.put('/:projectId', asyncMiddleware(async (req, res) => {
    const { projectId } = req.params;
    // Frontend (BreakdownEditor) se aane wala data: projectName aur breakdownData
    const { projectName, breakdownData } = req.body;

    if (!projectName || !breakdownData) {
        return res.status(400).json({ message: 'Missing project name or breakdown data in request body.' });
    }

    // 1. Project document ko update karen
    const updatedProject = await Project.findByIdAndUpdate(
        projectId, 
        { 
            $set: { 
                projectName: projectName, 
                // BreakdownEditor.jsx se aane wala data ab breakdownData field mein save hoga
                breakdownData: breakdownData 
            } 
        },
        { new: true, runValidators: true }
    ).lean(); // .lean() for faster, plain JavaScript object return

    if (!updatedProject) {
        return res.status(404).json({ message: 'Project not found for update.' });
    }

    // ✅ FIX FOR PLANNING PAGE BUG: Schedule document ko bhi update karen agar woh exist karta hai.
    // Planning Page (ShootingSchedulePage) schedule.allScenes se unscheduled scenes nikalta hai.
    const schedule = await Schedule.findOne({ projectId: projectId });

    if (schedule) {
        // Naye scenes ko schedule document ke allScenes mein daal dein
        schedule.allScenes = breakdownData; 
        await schedule.save();
        console.log(`✅ Schedule's allScenes updated (synced with Project breakdown) for project: ${projectId}`);
    } else {
        console.log(`ℹ️ No existing schedule found for project: ${projectId}. Skipping schedule sync.`);
    }

    res.status(200).json({ 
        message: 'Project details and breakdown updated successfully.', 
        project: updatedProject 
    });
}));


// -------------------------------------------------------------
// 5. DELETE Project
//    Path: /api/projects/:projectId
// -------------------------------------------------------------
router.delete('/:projectId', asyncMiddleware(async (req, res) => {
    const { projectId } = req.params;

    // 1. Project document ko delete karein
    const projectResult = await Project.findByIdAndDelete(projectId);
    
    if (!projectResult) {
        // Agar Project nahi mila, toh 404 error return karein
        return res.status(404).json({ message: 'Project not found' });
    }

    // 2. Us Project se mutalliq saare Scenes delete karein
    const sceneDeleteResult = await Scene.deleteMany({ projectId: projectId });
    console.log(`[Delete] Deleted ${sceneDeleteResult.deletedCount} scenes for project ${projectId}.`);

    // 3. Us Project se mutalliq saare Schedules delete karein
    const scheduleDeleteResult = await Schedule.deleteMany({ projectId: projectId });
    console.log(`[Delete] Deleted ${scheduleDeleteResult.deletedCount} schedules for project ${projectId}.`);


    // Agar sab theek raha, toh success message bhejen
    res.status(200).json({ 
        message: 'Project and all related data deleted successfully', 
        deletedProjectId: projectId 
    });
}));
// Export the router
module.exports = router;