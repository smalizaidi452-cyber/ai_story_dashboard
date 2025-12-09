import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const AddEpisodeModal = ({ projectId, onClose, onEpisodeAdded }) => {
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!episodeNumber || !title) return alert("Episode number and title are required");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/projects/episodes/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, episodeNumber, title, description }),
      });

      const data = await res.json();
      if (res.ok) {
        // 🔹 Add episode to parent state
        const newEpisode = data.project.episodes[data.project.episodes.length - 1];
        onEpisodeAdded(newEpisode);
        // Reset form
        setEpisodeNumber("");
        setTitle("");
        setDescription("");
        onClose();
      } else {
        alert(data.message || "Error adding episode");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while adding episode");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-blue-950 text-gray-100 p-6 rounded-2xl w-96 relative">
        <button
          className="absolute top-3 right-3 text-yellow-400 text-xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl mb-4 text-yellow-400">Add New Episode</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="number"
            placeholder="Episode Number"
            value={episodeNumber}
            onChange={(e) => setEpisodeNumber(e.target.value)}
            className="p-2 rounded bg-blue-800 text-yellow-300"
          />
          <input
            type="text"
            placeholder="Episode Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 rounded bg-blue-800 text-yellow-300"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 rounded bg-blue-800 text-yellow-300"
          />
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-500 text-white p-2 rounded mt-2"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Episode"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddEpisodeModal;
