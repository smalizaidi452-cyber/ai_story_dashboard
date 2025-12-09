// backend/models/scene.model.js
const mongoose = require("mongoose");

const sceneSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    episodeNumber: { type: String },
    sceneNumber: { type: String },
    time: { type: String },
    location: { type: String },
    subLocation: { type: String },
    characters: [{ type: String }],
    props: [{ type: String }],
    synopsis: { type: String },
    phoneTalk: { type: Boolean, default: false },
    scheduledDate: { type: String },
    recordedDate: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scene", sceneSchema);
