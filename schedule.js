// routes/schedule.js (FINAL & CORRECTED)
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// ✅ Schedule Model import
const { Schedule } = require("../models/schedule.model");


// Yeh route '/api/schedule/load/690aa2a535bd9d1a78c9d550' request ko handle karega.

// =========================================================
// 1. GET: /api/schedule/load/:projectId
// =========================================================
router.get("/load/:projectId", async (req, res) => {
    const projectId = req.params.projectId.trim(); 
    console.log(`📡 Fetching schedule by Project ID: ${projectId}`);

    let projectObjectId;
    try {
        // ⚠️ FIX: ID ko hamesha ObjectId mein convert karein
        projectObjectId = new mongoose.Types.ObjectId(projectId);
    } catch (err) {
        // Agar ID format hi galat hai
        return res.status(400).json({ 
            error: true, 
            message: "Invalid Project ID format." 
        });
    }

    try {
        // FIX: Converted ObjectId se dhoondein
        const schedule = await Schedule.findOne({ projectId: projectObjectId }); 
        
        if (!schedule) {
            // Schedule document nahi mila, toh 404 return hoga
            return res.status(404).json({ 
                success: false, 
                message: `Schedule not found for Project ID: ${projectId}` 
            });
        }
        
        // Success: Schedule data mil gaya hai
        return res.status(200).json({ 
            success: true, 
            schedule 
        });

    } catch (err) {
        console.error("❌ Error loading schedule:", err);
        res.status(500).json({ success: false, message: "Server error while loading schedule" });
    }
});
// ------------------------------------------------------------------
// ✅ Existing Route: Load Day Schedule (Auto-create if missing)
// ------------------------------------------------------------------
router.get("/load/day/:projectId/:dayNumber", async (req, res) => {
    const { projectId, dayNumber } = req.params;
    console.log(`📅 Fetching schedule for Project: ${projectId}, Day: ${dayNumber}`);

    // ... (Existing logic for loading/creating day schedule remains the same) ...

    try {
        let schedule = await Schedule.findOne({ projectId });

        // ✅ अगर schedule न हो तो नया बनाएं
        if (!schedule) {
            schedule = new Schedule({
                projectId,
                days: [
                    {
                        id: new mongoose.Types.ObjectId().toString(),
                        name: `Day ${dayNumber}`,
                        dayNumber: Number(dayNumber), // Ensure dayNumber is saved as a number if needed later
                        date: new Date().toISOString().split('T')[0], // Save only date part
                        scenes: [],
                    },
                ],
            });

            await schedule.save();
            console.log(`🆕 New schedule created for Project: ${projectId}`);
            return res.status(200).json(schedule.days[0]);
        }

        // ✅ अगर daySchedule मौजूद नहीं तो नया शामिल करें
        // Note: Aapke model mein dayNumber field nahi hai, isliye find karne ke liye `id` ya `name` use karna behtar hai.
        // Agar aap dayNumber se find kar rahe hain, toh model mein use shamil karna hoga.
        let daySchedule = schedule.days.find(
            (d) => d.dayNumber === Number(dayNumber) || d.name === `Day ${dayNumber}`
        );

        if (!daySchedule) {
            daySchedule = {
                id: new mongoose.Types.ObjectId().toString(),
                name: `Day ${dayNumber}`,
                dayNumber: Number(dayNumber),
                date: new Date().toISOString().split('T')[0],
                scenes: [],
            };

            schedule.days.push(daySchedule);
            await schedule.save();
            console.log(`🆕 New day added to project: ${projectId}, Day: ${dayNumber}`);
        }

        res.status(200).json(daySchedule);
    } catch (err) {
        console.error("❌ Error loading day schedule:", err.message);
        res.status(500).json({ error: true, message: err.message });
    }
});
// ------------------------------------------------------------------
// ✅ FIX 2: POST: Save Schedule API (Sahi URL aur Project ID Extraction)
// ------------------------------------------------------------------
// ⚠️ FIX: URL ko sirf "/save" karein aur projectId ko body se len.
router.post("/save", async (req, res) => {
    // ⚠️ CRITICAL FIX: projectId ko body ya params se len (params mein hoga nahi)
    const projectId = req.body.projectId || req.params.projectId; 
    const { scheduledDays, containerData, allScenes, days } = req.body;

    if (!projectId) {
        return res.status(400).json({
            success: false,
            message: "Project ID is missing. Cannot save schedule."
        });
    }

    let projectObjectId;
    try {
        projectObjectId = new mongoose.Types.ObjectId(projectId);
    } catch (err) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid Project ID format during save." 
        });
    }

    try {
        // FIX: ObjectId se dhoondein
        let schedule = await Schedule.findOne({ projectId: projectObjectId }); 
        
        const updateData = {
            scheduledDays: scheduledDays || [],
            containerData: containerData || {}, 
            allScenes: allScenes || [],
            days: days || [],
        };

        // ... (Baaki if/else update/create logic wahi rahegi) ...
        
        // Agar if/else logic ko chota karna ho to:
        if (schedule) {
             Object.assign(schedule, updateData);
             await schedule.save();
             return res.status(200).json({ success: true, message: "✅ Schedule updated successfully.", scheduleId: schedule._id });
        } else {
             const newSchedule = new Schedule({ projectId: projectObjectId, ...updateData });
             await newSchedule.save();
             return res.status(201).json({ success: true, message: "✅ New schedule created successfully.", scheduleId: newSchedule._id });
        }

    } catch (error) {
        console.error("❌ Error saving schedule:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: "Validation failed: " + error.message });
        }
        res.status(500).json({ success: false, message: "Server error while saving schedule" });
    }
});

module.exports = router;
