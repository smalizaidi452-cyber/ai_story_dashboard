// ============================================================
// ✅ schedule.model.js — FINAL (with day-wise structure)
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// ✅ Define daySchema (FIXED: Using 'id' instead of 'dayId')
// ============================================================

const daySchema = new mongoose.Schema({
    // FIX: 'dayId' was conflicting with data sent from frontend 'id'
    id: { type: String, required: true }, 
    name: { type: String, required: true },
    date: { type: String, required: false },
    scenes: [
        {
            // ✅ Yahan woh saari keys zaroori hain jo frontend use kar raha hai
            id: String,
            'EP No': String,        
            'Sc No': String,        
            Time: String,
            Location: String,
            Sub_Location: String,   // 🛑 FIX: Sub_Location shamil kiya
            Characters: String,     // 🛑 FIX: Characters shamil kiya
            Props: String,          // 🛑 FIX: Props shamil kiya
            Synopsis: String,       // 🛑 FIX: Synopsis shamil kiya
            'Phon Talk': String,    // 🛑 FIX: 'Phon Talk' shamil kiya
            
            'Sch. Date': String, 
            'Rec. Date': String, 
        },
    ],
});

const scheduleSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },

    // Old structure (retained for backward compatibility if needed, but 'id' is required)
    scheduledDays: [
        {
            id: { type: String, required: true },
            name: { type: String, required: true },
            date: { type: String, required: false },
        },
    ],

    // Example: { "day1": ["scene1", "scene2"], "day2": [...] }
    containerData: {
        type: Object,
        default: {},
    },

    // All scenes in project with their details
    allScenes: [
        {
            // ✅ Yeh structure zaroor daySchema.scenes se match hona chahiye
            id: String,
            'EP No': String,        
            'Sc No': String,        
            Time: String,
            Location: String,
            Sub_Location: String,   // 🛑 FIX
            Characters: String,     // 🛑 FIX
            Props: String,          // 🛑 FIX
            Synopsis: String,       // 🛑 FIX
            'Phon Talk': String,    // 🛑 FIX
        },
    ],

    // 👇 Added direct day-wise structure (using the FIXED daySchema)
    days: [daySchema],
}, { timestamps: true }); // Adding timestamps is a good practice

// ============================================================
// ✅ Helper Function: Load Schedule From DB (FIXED: Using 'id' for search)
// ============================================================

async function loadScheduleFromDB(projectId, dayId) {
    try {
        // Mongoose model ko sirf ek baar define karte hain, isliye findOne se pehle check karte hain
        const Schedule = mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);
        const schedule = await Schedule.findOne({ projectId });

        if (!schedule) {
            return { error: true, message: "Schedule not found for this project." };
        }

        // ✅ Try fetching from new days structure
        let dayData = null;
        if (schedule.days && schedule.days.length > 0) {
            // FIX: dayId ki jagah 'id' field se search karen
            dayData = schedule.days.find((d) => d.id === dayId);
        }

        // ✅ If not found in new structure, fallback to old method
        if (!dayData) {
            const { scheduledDays, containerData, allScenes } = schedule.toObject();
            const targetDay = scheduledDays.find((day) => day.id === dayId);

            if (!targetDay) {
                return { error: true, message: `Day ID '${dayId}' not found in schedule.` };
            }

            const sceneIds = containerData[dayId] || [];
            const allScenesMap = new Map(allScenes.map((s) => [s.id, s]));
            const dayScenes = sceneIds.map((id) => allScenesMap.get(id)).filter(Boolean);

            dayData = {
                id: dayId, // id shamil ki taa-ke consistent rahay
                name: targetDay.name,
                date: targetDay.date,
                scenes: dayScenes,
            };
        }

        return {
            error: false,
            data: {
                projectId,
                dayId: dayData.id, // Ab yeh 'id' use karega
                dayName: dayData.name,
                date: dayData.date,
                scenes: dayData.scenes || [],
            },
        };
    } catch (err) {
        console.error("💥 loadScheduleFromDB Error:", err);
        return { error: true, message: "Internal server error while loading schedule." };
    }
}

// ============================================================
// ✅ Model Export
// ============================================================

const Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = { Schedule, loadScheduleFromDB };