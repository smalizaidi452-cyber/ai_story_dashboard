// src/pages/ProductionPlanningPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // ✅ useParams ka import zaroori hai
import axios from 'axios'; 
import { Loader2, AlertTriangle, CalendarDays } from 'lucide-react';
import ShootingSchedulePage from './ShootingSchedulePage'; // ✅ Import karna zaroori hai

const API_BASE_URL = 'http://localhost:5000'; 

// ----------------------------------------------------
// ✅ FIX: Poora Logic Ab Ek Hi Function/Component Mein Hoga
// ----------------------------------------------------
function ProductionPlanningPage() {
    // 1. URL se Project ID nikalna
    const { projectId } = useParams(); // Ab projectId poore component mein accessible hai
    
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 2. Existing Project Data Fetch karna
    // projectId ko dependency list mein dalna zaroori hai
    const fetchProjectData = useCallback(async () => {
        // Yeh check `undefined` error ko hal karta hai
        if (!projectId) { 
            // Agar component bina ID ke load ho gaya hai, to ghalti dikhayen
            setError('Error: Project ID is missing from the URL. Please go back to the Projects list.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            // GET Route: /api/project/breakdown/:projectId se project details laana
            const response = await axios.get(`${API_BASE_URL}/api/project/breakdown/${projectId}`);
            
            setProject({
                id: response.data.projectId,
                name: response.data.projectName,
                // Breakdown aur Schedule data dono ko fetch karen
                breakdownData: response.data.breakdown || [], 
                // Schedule data abhi hum implement kar rahe hain, is liye ise bhi initialize karen
                scheduleData: response.data.schedule || [], 
            });

            setLoading(false);
            
        } catch (err) {
            console.error('Error fetching project for planning:', err);
            setError(`Failed to load project data. Server says: ${err.response?.status} ${err.response?.statusText}`);
            setLoading(false);
        }
    }, [projectId]); // ✅ Dependency mein projectId shamil karen

    useEffect(() => {
        fetchProjectData();
    }, [fetchProjectData]); // fetchProjectData jab bhi badlega (yani projectId) tabhi call hoga.


    // --- RENDER LOGIC ---
    
    // Loading State: Ab projectId yahan theek tarah se display hoga
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-blue-600 bg-blue-950">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                {/* Agar projectId abhi bhi undefined hai to default message dikhayen */}
                <p className='text-gray-200'>Loading Planning Dashboard for Project {projectId ? projectId : '...'}...</p> 
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-blue-950 min-h-[calc(100vh-4rem)] text-red-500">
                <AlertTriangle className="w-10 h-10 mb-4"/>
                <p className="text-xl font-bold">Error Loading Production Planning</p>
                <p className="text-gray-400 mt-2">{error}</p>
            </div>
        );
    }
    
    // Agar sab data theek hai to Production Planning ka content dikhayen
    return (
        <div className="p-8 bg-blue-950 min-h-[calc(100vh-4rem)] text-gray-100 max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center">
                <CalendarDays className="w-7 h-7 mr-3 text-red-400" />
                Production Planning: 
            </h1>
            <h2 className="text-2xl font-bold text-yellow-400 mb-6 border-b border-blue-700 pb-2">
                {project.projectName || project.name || 'Project Name Missing'}
            </h2>
            
            {/* MAIN GOAL: Shooting Schedule Component ko breakdown data den */}
            {project.breakdownData && project.breakdownData.length > 0 ? (
                <ShootingSchedulePage 
                    projectId={project.id} 
                    projectName={project.projectName || project.name}
                    initialBreakdown={project.breakdownData} // Breakdown data yahan pass hoga
                    // Future: initialSchedule={project.scheduleData} // Schedule data bhi pass karen
                />
            ) : (
                <div className="p-6 bg-red-900 rounded-lg text-white">
                    <p>No breakdown data found for scheduling. Please complete the breakdown in the Editor.</p>
                </div>
            )}
        </div>
    );
}

export default ProductionPlanningPage;