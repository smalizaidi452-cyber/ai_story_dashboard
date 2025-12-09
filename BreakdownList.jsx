// C:\Users\Acer\Desktop\ai_story_dashboard\frontend\src\pages\MyProjects.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Calendar, Loader2, Trash2, Edit3, AlertTriangle } from 'lucide-react'; 

const BreakdownList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // 1. Projects fetch karne ka function
    const fetchProjects = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/projects');
    
            setProjects(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
            // ✅ Urdu replaced with English
            setError('Failed to load the list of projects. Please check the server connection.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // 2. Edit project function
    const handleEdit = async (id, oldName) => {
        // ✅ Urdu replaced with English
        const newName = prompt("Enter new project name:", oldName); 
        if (!newName || newName.trim() === "" || newName === oldName) return;

        try {
            // Backend PUT route for editing (assuming /api/projects/:projectId is the route)
            await axios.put(`http://localhost:5000/api/projects/${id}`, {
                projectName: newName.trim()
            });
            // ✅ Urdu replaced with English
            alert("Project updated successfully ✅"); 
            fetchProjects();
        } catch (error) {
            console.error("Error updating project:", error);
            // ✅ Urdu replaced with English
            alert("An issue occurred while updating the project ❌"); 
        }
    };

    // 3. Delete project function
    const handleDelete = async (id) => {
        // ✅ Urdu replaced with English
        if (!window.confirm("Are you sure you want to delete this project?")) return; 

        try {
            // Backend DELETE route
            await axios.delete(`http://localhost:5000/api/projects/${id}`);
            // ✅ Urdu replaced with English
            alert("Project deleted successfully ✅"); 
            // State se project ko remove karen taake list update ho jaye
            setProjects(projects.filter(p => p._id !== id));
        } catch (error) {
            console.error("Error deleting project:", error);
            // ✅ Urdu replaced with English
            alert("An issue occurred while deleting the project ❌");
        }
    };

    // --- RENDER LOGIC ---

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-blue-600 bg-blue-950 min-h-[calc(100vh-4rem)]">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                {/* ✅ Urdu replaced with English */}
                <p className='text-gray-200'>Loading Projects...</p> 
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-blue-950 min-h-[calc(100vh-4rem)] text-red-500">
                <AlertTriangle className="w-10 h-10 mb-4"/>
                <p className="text-xl font-bold">Error Loading Projects</p>
                <p className="text-gray-400 mt-2">{error}</p>
             </div>
        );
    }

    return (
        // ✅ Theme change for consistency
        <div className="p-6 bg-blue-950 min-h-[calc(100vh-4rem)] text-gray-100">
            <h1 className="text-3xl font-extrabold text-yellow-400 mb-6 border-b border-yellow-600 pb-2">
                {/* ✅ Urdu replaced with English */}
                My Projects ({projects.length})
            </h1>
            
            {projects.length === 0 ? (
                <div className="text-center p-10 border-2 border-dashed border-blue-700 rounded-lg bg-blue-900">
                    <FileText className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    {/* ✅ Urdu replaced with English */}
                    <p className="text-gray-300">
                        You do not have any saved projects yet. Start a new breakdown!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">


{projects.map((project) => (
    <div
        key={project._id}
        className="flex justify-between items-start p-4 bg-blue-900 hover:bg-blue-800 border border-blue-700 rounded-lg transition duration-200 shadow-xl"
    >
        {/* Project Name/Date Section (Non-Clickable, sirf Display) */}
        <div className="flex-1 text-left mr-4">
            <h2 className="text-xl font-semibold text-yellow-400">{project.projectName}</h2>
            <div className="text-sm text-gray-400 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
            </div>
        </div>

        {/* ✅ Naye Action Buttons */}
        <div className="flex flex-col space-y-2">
            {/* 1. EDIT/BREAKDOWN Link: Pre-Production ka kaam */}
            <Link
                to={`/projects/${project._id}/breakdown`} // ✅ Naya Route: /projects/:id/breakdown
                className="flex items-center justify-center px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-blue-950 font-medium rounded transition duration-200 shadow-md"
                title="Edit Breakdown / Add More Script"
            >
                <FileText className="w-4 h-4 mr-2" /> Breakdown
            </Link>

            {/* 2. PRODUCTION PLANNING Link: Execution ka kaam */}
            <Link
                to={`/projects/${project._id}/planning`} // ✅ Naya Route: /projects/:id/planning
                className="flex items-center justify-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition duration-200 shadow-md"
                title="Go to Scheduling and Planning"
            >
                <Calendar className="w-4 h-4 mr-2" /> Planning
            </Link>
            
            {/* 3. Rename Button (pehle ki tarah) */}
            <button
                onClick={(e) => { e.stopPropagation(); handleEdit(project._id, project.projectName); }}
                className="flex items-center justify-center px-3 py-1 text-sm text-yellow-500 hover:text-yellow-300 transition border border-yellow-500 rounded"
                title="Rename Project"
            >
                <Edit3 className="w-4 h-4 mr-1" /> Rename
            </button>
            
            {/* 4. Delete Button (pehle ki tarah) */}
            <button
                onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}
                className="flex items-center justify-center px-3 py-1 text-sm text-red-500 hover:text-red-300 transition border border-red-500 rounded"
                title="Delete Project"
            >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
            </button>
        </div>
    </div>
))}
                </div>
            )}
        </div>
    );
};

export default BreakdownList;