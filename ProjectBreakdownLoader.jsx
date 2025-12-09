// C:\Users\Acer\Desktop\ai_story_dashboard\frontend\src\components\ProjectBreakdownLoader.jsx

import React, { useState, useEffect, useCallback } from 'react'; // ✅ useCallback ko add kiya
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // ✅ useNavigate ko add kiya
import BreakdownTable from './BreakdownTable'; 
import { Loader2 } from 'lucide-react';

const ProjectBreakdownLoader = () => {
    // Get projectId from URL
    const { projectId } = useParams(); 
    // ✅ Navigation ke liye useNavigate hook
    const navigate = useNavigate();
    
    // State to store the full project object
    const [projectData, setProjectData] = useState(null); 
    // ✅ State to store the list of all projects
    const [allProjects, setAllProjects] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // =========================================================
    // ✅ Project Breakdown Fetch Karne ka Main Function (Memoized)
    // =========================================================
    const fetchBreakdown = useCallback(async (id) => {
        if (!id) {
            setError('Project ID is missing.'); 
            setProjectData(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null); 
            
            // Backend API ko call karen 
            const response = await axios.get(`http://localhost:5000/api/projects/${id}`);
            setProjectData(response.data);
            setLoading(false);

        } catch (err) {
            console.error("Failed to fetch breakdown:", err);
            setProjectData(null);
            
            if (err.response && err.response.status === 404) {
                setError('The requested project was not found in the database.');
            } else {
                setError('Failed to load breakdown data. Please check server and network connection.');
            }
            setLoading(false);
        }
    }, []); // useCallback dependency array khaali rakha hai

    // =========================================================
    // ✅ Tamam Projects ki List Fetch karna (Sirf ek baar)
    // =========================================================
    useEffect(() => {
        const fetchAllProjects = async () => {
            try {
                // Assuming this endpoint returns [{ _id, name }, ...]
                const response = await axios.get('http://localhost:5000/api/projects'); 
                setAllProjects(response.data);
            } catch (err) {
                console.error("Failed to fetch all projects list:", err);
            }
        };
        fetchAllProjects();
    }, []); 

    // =========================================================
    // ✅ URL (projectId) badalne par breakdown fetch karna
    // =========================================================
    useEffect(() => {
        if (projectId) {
            fetchBreakdown(projectId);
        }
    }, [projectId, fetchBreakdown]); // Jab bhi projectId badlega, fetchBreakdown chalega

    // =========================================================
    // ✅ Project Dropdown se naya Project select karne ka Handler
    // =========================================================
    const handleProjectSelect = (projectName) => {
        // Find the selected project object
        const selectedProject = allProjects.find(p => p.name === projectName);
        
        if (selectedProject) {
            // URL ko naye project ID ke sath update karen
            // is se useEffect dobara chalega aur naya data load hoga
            navigate(`/project/${selectedProject._id}/breakdown`); 
        }
    };

    // UI Rendering
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-blue-400">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <p>Loading project breakdown...</p>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-300 bg-red-800 rounded-lg shadow-xl">{error}</div>;
    }

    const breakdownArray = projectData?.breakdownData || []; 

    // If projectData or breakdown array is missing/empty
    if (!projectData || breakdownArray.length === 0) {
        return (
            <div className="p-10 text-center text-yellow-300 bg-gray-800 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-3">No Breakdown Data Available.</h2>
                <p>Project "{projectData?.projectName}" is saved, but it contains no scene breakdown.</p>
            </div>
        );
    }

    // Render BreakdownTable with all necessary props
    return (
        <div className="p-0">
            <h1 className="text-3xl font-extrabold text-blue-400 mb-6">{projectData.projectName} Breakdown</h1>
            <div className="bg-gray-700 rounded-xl p-6 shadow-md overflow-x-auto">
                <BreakdownTable 
                    breakdownData={breakdownArray} 
                    currentProjectName={projectData.projectName} 
                    allProjects={allProjects} 
                    onProjectSelect={handleProjectSelect} 
                />
            </div>
        </div>
    );
};

export default ProjectBreakdownLoader;