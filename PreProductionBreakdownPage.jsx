// frontend\src\pages\PreProductionBreakdownPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import EditableBreakdownTable from '../components/EditableBreakdownTable';
import { FileText, Loader2, AlertTriangle } from 'lucide-react';

const PreProductionBreakdownPage = () => {
    const { projectId } = useParams(); 
    const navigate = useNavigate(); 
    
    const [loading, setLoading] = useState(true);
    const [breakdownData, setBreakdownData] = useState([]);
    const [projectName, setProjectName] = useState('Select a Project...');
    const [error, setError] = useState(null);
    const [allProjects, setAllProjects] = useState([]); 

    const [selectedProjectName, setSelectedProjectName] = useState('');
    
    // States for Filtering
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedEpisode, setSelectedEpisode] = useState('');
    const [viewMode, setViewMode] = useState('table'); // Default view table

    // --- Data Fetching Effect ---
    useEffect(() => {
        setSelectedLocation('');
        setSelectedEpisode('');

        if (projectId) {
            setLoading(true);
            setError(null);
            
            const fetchProjectBreakdown = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/api/project/breakdown/${projectId}`); 
                    const name = response.data.projectName || `Project ${projectId.substring(0, 8)}`;
                    
                    // CRITICAL: Scene data ko unique IDs mil jayen
                    const dataWithIds = (response.data.breakdown || []).map((scene, index) => ({
                        // _id ya to MongoDB se, ya index se banayen
                        _id: scene._id || `${scene["EP No"]}-${scene["Sc No"]}-${index}`, 
                        ...scene
                    }));

                    setBreakdownData(dataWithIds);
                    setProjectName(name);
                    setSelectedProjectName(name);
                    setLoading(false);
                } catch (err) {
                    console.error("Error fetching breakdown:", err);
                    setError('Failed to load project breakdown data. Check server status.');
                    setBreakdownData([]); 
                    setProjectName('Data Error');
                    setSelectedProjectName('');
                    setLoading(false);
                }
            };
            fetchProjectBreakdown();
        } else {
            setProjectName('Select a Project for Breakdown Editing');
            setBreakdownData([]); 
            setSelectedProjectName('');
            setLoading(false);
        }
    }, [projectId]); 


    // --- All Projects Fetching Effect (For Select Dropdown) ---
    useEffect(() => {
        const fetchAllProjects = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/projects');
                setAllProjects(response.data); 
            } catch (err) {
                console.error("Error fetching all projects list:", err);
            }
        };
        fetchAllProjects();
    }, []);

    // --- Handlers ---
    const handleProjectSelect = (name) => {
        const project = allProjects.find(p => p.projectName === name);
        if (project && project._id) {
            navigate(`/pre-production/${project._id}`); // New Route
        } else if (name === "") {
            navigate(`/pre-production`); // New Base Route
        }
    };

    // Callback to update data in frontend after successful edit (Optimistic Update)
    const handleBreakdownUpdate = useCallback((sceneId, field, newValue) => {
        setBreakdownData(prevData => prevData.map(scene => {
            if (scene._id === sceneId) {
                return { ...scene, [field]: newValue };
            }
            return scene;
        }));
    }, []);


    // --- Filtering Logic ---
    const getFilteredBreakdown = () => {
        let data = breakdownData;

        if (selectedLocation) {
            data = data.filter(scene => scene.Location === selectedLocation);
        }
        if (selectedEpisode) {
            data = data.filter(scene => scene["EP No"] === selectedEpisode);
        }

        return data;
    };

    const filteredBreakdown = getFilteredBreakdown();

    const uniqueLocations = [...new Set(breakdownData.map(scene => scene.Location))].filter(l => l);
    const uniqueEpisodes = [...new Set(breakdownData.map(scene => scene["EP No"]))].filter(e => e);


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-yellow-400 bg-blue-950">
                <Loader2 className="animate-spin w-8 h-8 mr-2" />
                Loading Project Breakdown for Editing...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-red-400 bg-blue-950">
                <AlertTriangle className="w-10 h-10 mb-4" />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto p-4 sm:p-6 lg:p-8 bg-blue-950 min-h-screen">
            
            <h1 className="text-3xl font-bold mb-6 text-yellow-400 border-b border-yellow-600 pb-3 flex items-center">
                <FileText className="w-6 h-6 mr-3"/>
                Pre-Production: Breakdown Editing
            </h1>

            <div className="bg-blue-900 p-6 rounded-xl shadow-lg mb-6 border border-blue-800">
                <h2 className="text-xl font-bold mb-4 text-gray-100">
                    Current Project: <span className='text-yellow-400'>{projectName}</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Project Select Box */}
                    <select 
                        value={selectedProjectName} 
                        onChange={(e) => handleProjectSelect(e.target.value)}
                        className="bg-blue-800 text-gray-200 p-3 rounded border border-blue-700 focus:ring focus:ring-yellow-500 col-span-1 md:col-span-3"
                    >
                        <option value="">Select a Project for Editing</option>
                        {allProjects.map(project => (
                            <option key={project._id} value={project.projectName}>{project.projectName}</option>
                        ))}
                    </select>

                    {/* Location Filter */}
                    <select 
                        value={selectedLocation} 
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="bg-blue-800 text-gray-200 p-2 rounded border border-blue-700 focus:ring focus:ring-yellow-500"
                        disabled={!projectId}
                    >
                        <option value="">Filter by Location</option>
                        {uniqueLocations.map(location => (
                            <option key={location} value={location}>{location}</option>
                        ))}
                    </select>

                    {/* Episode Filter */}
                    <select 
                        value={selectedEpisode} 
                        onChange={(e) => setSelectedEpisode(e.target.value)}
                        className="bg-blue-800 text-gray-200 p-2 rounded border border-blue-700 focus:ring focus:ring-yellow-500"
                        disabled={!projectId}
                    >
                        <option value="">Filter by Episode</option>
                        {uniqueEpisodes.map(episode => (
                            <option key={episode} value={episode}>Episode {episode}</option>
                        ))}
                        
                    </select>

                    <div className='flex items-center justify-center text-gray-400'>
                        // ... (Filter dropdowns ke baad)
                    <div className='flex items-center space-x-3'>
                    {/* ✅ NEW: View Toggle Buttons */}
                <button
                    onClick={() => setViewMode('table')}
                        className={`px-3 py-1 rounded transition duration-200 ${
                viewMode === 'table' ? 'bg-yellow-500 text-blue-900 font-bold' : 'bg-blue-800 text-gray-400 hover:text-yellow-400'
                }`}
                    title="Table View"
                    >
                    <List className='w-5 h-5' />
                </button>
                <button
                    onClick={() => setViewMode('card')}
            className={`px-3 py-1 rounded transition duration-200 ${
            viewMode === 'card' ? 'bg-yellow-500 text-blue-900 font-bold' : 'bg-blue-800 text-gray-400 hover:text-yellow-400'
        }`}
            title="Card View"
             >
                <FileText className='w-5 h-5' />
                </button>
            </div>
                        Total Scenes: <span className='font-bold text-yellow-400 ml-1'>{filteredBreakdown.length}</span>
                    </div>

                </div>
            </div>

            {/* Editable Breakdown Table */}
            {/* ----------------- Editable Breakdown Display ----------------- */}
                {projectId && filteredBreakdown.length > 0 ? (
            // ✅ NEW: Conditional Rendering
            viewMode === 'table' ? (
                    <EditableBreakdownTable 
                    breakdownData={filteredBreakdown}
                    projectId={projectId}
                onDataUpdate={handleBreakdownUpdate}
                />
        ) : (
        // ✅ Card View Implementation
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filteredBreakdown.map(scene => (
                    <SceneCard key={scene.id} scene={scene} />
                    ))}
                </div>
                )
            ) : (
            // ... (No scenes message) ...
            <div className="p-8 text-center text-gray-400 bg-blue-900 rounded-lg">
            {projectId
                ? 'No scenes match the selected filters. Try adjusting the filters.'
                : 'Please select a project above to view and edit its production breakdown.'}
            </div>
            )}
        </div>
    );
};

export default PreProductionBreakdownPage;