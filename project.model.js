// ===========================================================
// ✅ project.model.js — FINAL CODE with Sc No String Fix
// ===========================================================
const mongoose = require('mongoose');

// Scene Schema - Defines the structure for a single scene breakdown entry
const sceneSchema = new mongoose.Schema({
    "EP No": { type: String, required: true },
    // FIX: Changed type from Number to String to accept '4A', '5B', etc.
    "Sc No": { type: String, required: true },
    Time: { type: String, default: "Day/Night" },
    Location: { type: String, required: true },
    Sub_Location: { type: String, default: "N/A" },
    Characters: { type: String, required: true },
    Scene_Synopsis: { type: String, required: true },
    Props: { type: String, default: "None" },
    Phone_Talk: { type: String, enum: ['Yes', 'No', 'N/A'], default: 'No' },
}, { _id: false }); 

// Project Schema - Defines the overall project structure
const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true,
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        // Using false for dummy data testing as per current server.js
        required: false, 
        ref: 'User',
    },
    breakdownData: {
        type: [sceneSchema],
        default: [],
    },
    totalEpisodes: {
        type: Number,
        default: 1,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
