import mongoose from "mongoose";

const episodeSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  episodeNumber: { type: String, required: true },
  title: String,
  synopsis: String,
  totalScenes: Number,
}, { timestamps: true });

export default mongoose.model("Episode", episodeSchema);
