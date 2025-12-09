// ===========================================================
// ✅ server.js — FINAL CODE Imports
// ===========================================================
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const fileUpload = require('express-fileupload'); // ✅ Zaroori Import
const Project = require('./models/project.model');
const { Schedule, loadScheduleFromDB } = require("./models/schedule.model");
const projectRoutes = require('./routes/projects');
const scheduleRoutes = require('./routes/schedule');
const sceneRoutes = require("./routes/scenes");
const { GoogleGenAI } = require('@google/genai');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY); // ✅ AI Setup Ooper Layen

// 1. Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 2. File Upload Middleware (Must be before any route that handles file uploads)
app.use(fileUpload({ 
    createParentPath: true,
})); 
// ✅ NEW: PUT /api/projects/:projectId - Update project name and breakdown data
app.put('/api/projects/:projectId', async (req, res) => {
    const { projectId } = req.params;
    const { projectName, breakdownData } = req.body; 

    try {
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            {
                projectName: projectName, 
                breakdownData: breakdownData, 
            },
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: "Project not found for update." });
        }

        res.status(200).json({
            message: "Project updated successfully.",
            project: updatedProject,
        });

    } catch (error) {
        console.error('❌ Error updating project breakdown:', error);
        res.status(500).json({ message: 'Server error during project update.', error: error.message });
    }
});
// 3. API Routes
app.use('/api/schedule', scheduleRoutes); 
app.use('/api/projects', projectRoutes);
app.use('/api/scenes', sceneRoutes);

//app.use("/api/projects", require("./routes/projects"));
//app.use('/api/schedule', require('./routes/schedule'));

// **********************************************
// **** MongoDB Connection Setup ****
// **********************************************

const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🟢 MongoDB Connected Successfully!'))
  .catch(err => console.error('🔴 MongoDB Connection Error:', err.message));
} else {
    console.warn("🟡 Warning: MONGO_URI not found in .env. Database functionality will be skipped.");
}

// ===========================================================
// 🛠️ HELPER FUNCTION: Script se text extract karna
// ===========================================================
async function extractScriptText(scriptFile) {
    const dataBuffer = scriptFile.data;
    const fileExtension = path.extname(scriptFile.name).toLowerCase(); // ✅ .name property
    let scriptText;

    if (fileExtension === '.docx') {
        console.log('📄 DOCX file detected. Extracting text using Mammoth...');
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        scriptText = result.value;
    } else if (fileExtension === '.pdf') {
        console.log('📄 PDF file detected. Extracting text using PDF-Parse...');
        const pdfData = await pdf(dataBuffer);
        scriptText = pdfData.text;
    } else {
        throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
    }
    
    if (!scriptText || scriptText.trim().length < 100) {
        throw new Error("Could not extract sufficient text from the file. Please check file quality.");
    }
    return scriptText;
}

// ... (systemInstruction remains the same) ...
        
    const systemInstruction = 

    `You are an expert Script Breakdown AI, specializing in challenging Urdu/Roman Urdu screenplays. Your primary goal is to ensure the **highest fidelity** to the original script details. The input is raw text, potentially from OCR or DOCX.

**🎯 PRIMARY TASK: Analyze the raw text, correct any minor errors, ensure accurate transliteration, and provide ONLY a PURE JSON array that strictly follows the provided format.**

---

**📜 CRITICAL RULES & EXTRACTION LOGIC:**

1.  **Language & Naming Integrity (CRUCIAL):**
    * **Transliteration Logic:**
        * If the original text is in Urdu (e.g., 'ریستوراں', 'زریاب کا گھر'), **transliterate it directly into standard Roman Urdu** (e.g., 'Restaurant', 'Zaryab ka Ghar'). **DO NOT translate.**
    * **Character Names/Fix:** Identify the actual main characters (Zaryab and Zaail) and use their correct Roman Urdu names. **STRICTLY AVOID inventing or substituting names (e.g., Ishfaq/Fariyal).**

2.  **Scene Identification:**
    * **'EP No' / 'Sc No'**: Extract the episode number and scene number/sub-scene (e.g., '13', '4A'). Both must be **strings**.
    * **Props:** Detect *ALL* physical objects, furniture, and set dressing elements mentioned (e.g., Mobile, Tea Cup, File, Sofa). **CRITICAL: DO NOT USE "None" unless you are 100% sure the scene is completely devoid of objects.**
    * **Phone Talk Logic:** Indicate **'Yes'** if any character is seen using a mobile, a landline, or having a conversation *on the phone*. Otherwise, use **'No'**.

3.  **Location/Time:**
    * **'Location'**: Main setting, correctly transliterated (e.g., 'Zaryab ka Ghar' or 'Restaurant').
    * **'Sub_Location'**: Specific room (e.g., 'Living Room'). Use 'N/A' ONLY if no sub-area is mentioned.

4.  **Synopsis:**
    * **'Scene_Synopsis'**: A concise, 10-12 words summary of the action in **Roman Urdu**.

---
**STRICT OUTPUT FORMAT (CRITICAL):**
Return ONLY the PURE JSON array (no text, no explanation). The JSON structure must strictly adhere to the following types:
[
  {
    "EP No": "string",
    "Sc No": "string",
    "Time": "string",
    "Location": "string",
    "Sub_Location": "string",
    "Characters": "string",
    "Scene_Synopsis": "string",
    "Props": "string",
    "Phone_Talk": "string" 
  }
]
`;

// ===========================================================
// ✅ 1. AI Breakdown Route (NEW: Generate only - /api/generate-breakdown)
// ===========================================================
app.post('/api/generate-breakdown', async (req, res) => {
    console.log('📡 /api/generate-breakdown route hit - file received request...');

    try {
        if (!req.files || !req.files.scriptFile) { 
            return res.status(400).json({ message: "Script file is required." });
        }

        const scriptFile = req.files.scriptFile; 
        const scriptText = await extractScriptText(scriptFile);
        
        console.log('🤖 Sending script to Gemini AI for breakdown...');

        // 3. Gemini AI Call & JSON Parsing (Logic copied from your old breakdown route)
        const model = 'gemini-2.5-flash';
        const response = await ai.models.generateContent({
            model,
            contents: [ { role: "user", parts: [{ text: scriptText }] } ],
            config: { systemInstruction: systemInstruction },
        });
        
        const jsonResponseText = response.text.trim();
        let cleanJsonText = jsonResponseText.trim();
        if (cleanJsonText.startsWith('```json')) cleanJsonText = cleanJsonText.substring('```json'.length).trim();
        if (cleanJsonText.endsWith('```')) cleanJsonText = cleanJsonText.substring(0, cleanJsonText.length - '```'.length).trim();
        
        const breakdownArray = JSON.parse(cleanJsonText);
        
        // Sirf breakdown data return karen, save mat karen
        res.status(200).json({
            message: "Breakdown generated successfully (Not saved).",
            breakdown: breakdownArray, 
        });

    } catch (error) {
        console.error('❌ Error generating breakdown:', error.message);
        res.status(500).json({ message: 'Server error during breakdown generation.', error: error.message });
    }
});

// ===========================================================
// ✅ 2. AI Breakdown Route (ORIGINAL: Save Project - /api/breakdown)
// ===========================================================
app.post('/api/breakdown', async (req, res) => {
    console.log('📡 /api/breakdown route hit - file received request...');

    try {
        // 1. File Check
        if (!req.files || !req.files.scriptFile) {
            return res.status(400).json({ message: "Script file is required." });
        }
        const scriptFile = req.files.scriptFile;

        // 2. File Reading Logic
        const scriptText = await extractScriptText(scriptFile);
        console.log('🤖 Sending script to Gemini AI for breakdown...');

        // 3. Gemini AI Call & JSON Parsing
        const model = 'gemini-2.5-flash';
        const response = await ai.models.generateContent({
            model,
            contents: [ { role: "user", parts: [{ text: scriptText }] } ],
            config: { systemInstruction: systemInstruction },
        });

        const jsonResponseText = response.text.trim();
        let cleanJsonText = jsonResponseText.trim();
        if (cleanJsonText.startsWith('```json')) {
        cleanJsonText = cleanJsonText.substring('```json'.length).trim();
    }
        if (cleanJsonText.endsWith('```')) {
        cleanJsonText = cleanJsonText.substring(0, cleanJsonText.length - '```'.length).trim();
}
        
        let breakdownArray = JSON.parse(cleanJsonText);

        // 4. Saving to MongoDB Logic (Purane req.file.originalname reference ko theek kiya)
        const { projectName } = req.body;
        const userId = '60c72b1f9f2b8f0015b6d9c7'; // Dummy ID

        let totalEpisodes = 1;
        if (breakdownArray.length > 0) {
            const epNoValue = breakdownArray[0]["EP No"];
            const parsed = parseInt(epNoValue);
            totalEpisodes = !isNaN(parsed) ? parsed : 1;
        }

        const newProject = new Project({
            // ✅ FIX: scriptFile.name use kar rahe hain
            projectName: projectName || scriptFile.name.replace(path.extname(scriptFile.name), ''), 
            user: userId,
            breakdownData: breakdownArray,
            totalEpisodes,
        });

        await newProject.save();

        console.log(`✅ Breakdown completed & saved: ${newProject.projectName}`);
        res.status(200).json({
            message: "Script broken down and saved successfully!",
            projectId: newProject._id,
            breakdown: breakdownArray,
        });

    } catch (error) {
        console.error("❌ Breakdown Error:", error.message);
        res.status(500).json({ message: "An error occurred during script breakdown.", error: error.message });
    }
});
// ===========================================================
// 🚀 NEW ROUTE: Create Project (Save Project Button ke liye)
// ===========================================================
app.post('/api/projects', async (req, res) => {
    console.log('📡 /api/projects route hit for project creation (via Save button)');
    
    try {
        const { projectName, scenes, status } = req.body;
        
        if (!scenes || scenes.length === 0) {
            return res.status(400).json({ message: 'No scene data received to save.' });
        }

        const userId = '60c72b1f9f2b8f0015b6d9c7'; // Dummy ID (agar aap authentication use nahi kar rahe)

        // Project Model ka instance create karen
        const newProject = new Project({
            projectName: projectName || `New Saved Project - ${new Date().toISOString()}`,
            user: userId,
            breakdownData: scenes, // Frontend se 'scenes' key aayegi
            status: status || 'Draft',
            // totalEpisodes ko hum yahan skip kar rahe hain ya calculated field add kar sakte hain
        });

        const savedProject = await newProject.save();

        console.log(`✅ New project saved from dashboard: ${savedProject.projectName}`);
        res.status(201).json({ 
            message: 'Project successfully saved!',
            projectId: savedProject._id,
            projectName: savedProject.projectName
        });

    } catch (error) {
        console.error('❌ Error saving project from Save button:', error);
        res.status(500).json({ message: 'Server error during new project save.', error: error.message });
    }
});
// ✅ API: Save or Update Schedule for a Project
    {/*app.post('/api/schedule/save', async (req, res) => {
    try {
        const { projectId, scheduledDays, containerData, allScenes } = req.body;

        if (!projectId) {
            return res.status(400).json({ success: false, message: "projectId is required." });
        }

        // ⚙️ Try to find existing schedule for this project
        let schedule = await Schedule.findOne({ projectId });

        if (schedule) {
    // 🔄 If found, update existing schedule
    schedule.days = scheduledDays || schedule.days; // <--- scheduledDays ko days se replace karen
    schedule.containerData = containerData || schedule.containerData;
    schedule.allScenes = allScenes || schedule.allScenes;
    await schedule.save();
// ...
} else {
    // 🆕 Otherwise create a new one
    const newSchedule = new Schedule({
        projectId,
        days: scheduledDays || [], // <--- scheduledDays ko days se replace karen
        containerData: containerData || {},
        allScenes: allScenes || [],
    });

            await newSchedule.save();

            return res.status(201).json({
                success: true,
                message: "✅ New schedule created successfully.",
                schedule: newSchedule,
            });
        }
    } catch (error) {
        console.error("💥 Error saving schedule:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while saving schedule.",
        });
    }
});*/}
// ✅ Get Project Breakdown by ID (for BreakdownEditor & ProductionPlanning)
// ✅ Existing Endpoint (Project Breakdown)
app.get('/api/project/breakdown/:projectId', async (req, res) => {
    const { projectId } = req.params;
    console.log(`📡 /api/project/breakdown/${projectId} route hit`);

    try {
        if (!Project) {
            console.error('❌ Project Model is missing in server.js');
            return res.status(500).json({ message: 'Server error: Project model missing.' });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            console.warn(`⚠️ Project not found in DB for ID: ${projectId}`);
            return res.status(404).json({ message: 'Project not found.' });
        }

        res.status(200).json({
            projectId: project._id,
            projectName: project.projectName,
            breakdown: project.breakdownData || [],
        });

    } catch (error) {
        console.error('💥 Server Error while fetching project breakdown:', error.message);
        res.status(500).json({ message: 'Internal server error while fetching project breakdown.' });
    }
});
// ✅ NEW Endpoint: Sirf Day-Specific Schedule Data Load Karna
// ✅ Load Day-Specific Schedule from DB
// ✅ Load Schedule for a specific day
// ✅ NEW Endpoint: Sirf Day-Specific Schedule Data Load Karna (CORRECTED)
app.get('/api/schedule/load/day/:projectId/:dayId', async (req, res) => {
    const { projectId, dayId } = req.params;

    try {
        console.log(`📅 Fetching schedule for Project: ${projectId}, Day: ${dayId}`);

        // 1. Fetch schedule data from DB
        const schedule = await Schedule.findOne({ projectId });

        if (!schedule) {
            return res.status(404).json({ error: "Schedule not found for this project." });
        }

        // Mongoose document ko object mein convert karein taa-ke properties aasani se mil saken
        const scheduleObject = schedule.toObject(); 

        // 2. Day Metadata dhoondna (Ab 'days' array mein data hoga, Solution A ki wajah se)
        // Note: Hum day object ko 'id' field se dhoond rahe hain, kyuki frontend 'id' use karta hai.
        const dayData = scheduleObject.days.find(day => day.id === dayId);
        
        if (!dayData) {
            return res.status(404).json({ error: "Day data not found." });
        }
        
        // 3. Scene IDs dhoondna (containerData se)
        const sceneIds = scheduleObject.containerData[dayId] || [];

        // 4. All Scenes se scenes filter karna
        const allScenesMap = new Map(scheduleObject.allScenes.map(scene => [scene.id, scene]));
        const dayScenes = sceneIds.map(id => allScenesMap.get(id)).filter(Boolean); // Filter(Boolean) removes null/undefined

        // ✅ FINAL RESPONSE: Day ki metadata aur scenes dono bhejen
        res.json({
            dayName: dayData.name,
            date: dayData.date,
            scenes: dayScenes, // <--- Scenes ka data ab shamil hai
            projectId: projectId,
            dayId: dayId
        });
        
    } catch (error) {
        // Validation failed error ya dusre errors yahan capture honge
        console.error("❌ Error loading day schedule:", error);
        res.status(500).json({ error: `Server error while loading day schedule: ${error.message}` });
    }
});
// ===========================================================
// ✅ AI Breakdown Route (Supports PDF and DOCX)
// ===========================================================
app.post('/api/breakdown', async (req, res) => {
    console.log('📡 /api/breakdown route hit - file received request...');

    try {
        // ... (File processing and AI logic remains the same) ...
        if (!req.files || !req.files.scriptFile) {
             return res.status(400).json({ message: "Script file is required." });
        }
        const scriptFile = req.files.scriptFile;

// ===========================================================
// 🚀 NEW ROUTE: Delete Project by ID (CORRECTED)
// ===========================================================
app.delete('/api/projects/:projectId', async (req, res) => {
    console.log(`📡 /api/projects/${req.params.projectId} route hit for deletion`);
    
    try {
        const projectId = req.params.projectId;
        const result = await Project.findByIdAndDelete(projectId);

        if (!result) {
            return res.status(404).json({ message: 'Project not found for deletion.' });
        }

        console.log(`✅ Project ID ${projectId} successfully deleted.`);
        res.status(200).json({ message: 'Project deleted successfully.' });

    } catch (error) {
        console.error('❌ Error deleting project:', error);
        res.status(500).json({ message: 'Server error during project deletion.' });
    }
});
// ✅ Delete Schedule by Project ID
app.delete('/api/schedule/delete/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "projectId is required."
            });
        }

        const deleted = await Schedule.findOneAndDelete({ projectId });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: `No schedule found for projectId: ${projectId}`
            });
        }

        res.status(200).json({
            success: true,
            message: "✅ Schedule deleted successfully.",
            deleted
        });
    } catch (error) {
        console.error("💥 Error deleting schedule:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while deleting schedule."
        });
    }
});
// 👆 👆 👆 DELETE route yahan khatam ho gaya.

        // ... (AI model call remains the same) ...
        const model = 'gemini-2.5-flash';
        const response = await ai.models.generateContent({
            model,
            contents: [
                { role: "user", parts: [{ text: scriptText }] }
            ],
            config: {
                systemInstruction: systemInstruction,
            },
        });

        const jsonResponseText = response.text.trim();
        let breakdownArray;
        
        // FIX: Remove markdown code block wrappers (```json and ```)
        let cleanJsonText = jsonResponseText.trim();
        
        if (cleanJsonText.startsWith('```json')) {
            cleanJsonText = cleanJsonText.substring('```json'.length).trim();
        }
        if (cleanJsonText.endsWith('```')) {
            cleanJsonText = cleanJsonText.substring(0, cleanJsonText.length - '```'.length).trim();
        }

        try {
            breakdownArray = JSON.parse(cleanJsonText);
        } catch (parseError) {
            console.error("❌ JSON Parse Error:", parseError);
            console.error("⚠️ Raw AI Text:", jsonResponseText);
            return res.status(500).json({
                message: "AI returned invalid JSON. Please check the prompt or script format.",
                rawResponse: jsonResponseText
            });
        }

        // ... (Saving to MongoDB logic remains the same) ...
        const { projectName } = req.body;
        const userId = '60c72b1f9f2b8f0015b6d9c7'; // Dummy ID

        let totalEpisodes = 1;
        if (breakdownArray.length > 0) {
            const epNoValue = breakdownArray[0]["EP No"];
            const parsed = parseInt(epNoValue);
            totalEpisodes = !isNaN(parsed) ? parsed : 1;
        }

        const newProject = new Project({
            projectName: projectName || req.file.originalname.replace('.pdf', ''),
            user: userId,
            breakdownData: breakdownArray,
            totalEpisodes,
        });

        await newProject.save();

        console.log(`✅ Breakdown completed & saved: ${newProject.projectName}`);
        res.status(200).json({
            message: "Script broken down and saved successfully!",
            projectId: newProject._id,
            breakdown: breakdownArray,
        });

    } catch (error) {
        console.error("❌ Breakdown Error:", error.message);
        res.status(500).json({ message: "An error occurred during script breakdown.", error: error.message });
    }
});

// ===========================================================
// ✅ Health Check Route
// ===========================================================
app.get('/api/health', (req, res) => {
    res.json({ status: "OK", time: new Date().toISOString() });
});

// ===========================================================
// ✅ Start Server
// ===========================================================
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
const MAX_SERVER_TIMEOUT = 300000;
server.timeout = MAX_SERVER_TIMEOUT;
server.keepAliveTimeout = MAX_SERVER_TIMEOUT;
server.headersTimeout = MAX_SERVER_TIMEOUT;
console.log(`⏳ Server timeout set to ${MAX_SERVER_TIMEOUT / 1000}s.`);
