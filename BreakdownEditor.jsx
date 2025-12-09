// src/pages/BreakdownEditor.jsx (Complete File - Replace your existing file)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertTriangle, Save, Upload } from 'lucide-react';

// Import Components
import UploadScript from '../components/UploadScript'; 

// Helper function for unique ID (Agar scene object mein _id/id nahi hai to use hoga)
const generateUniqueId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString().substring(9);


// ✅ REPLACEMENT for EditableBreakdownTable component inside BreakdownEditor.jsx
const EditableBreakdownTable = ({ breakdownData, setBreakdownData }) => {
    
    // Function to get the correct data key from the display header
    const getDataKey = (header) => {
        if (header === "Synopsis") return "Scene_Synopsis"; 
        if (header === "Phone Talk") return "Phone_Talk";
        if (header === "Sub-Loc") return "Sub_Location"; 
        return header;
    };

    // Zaroori Heads ki list (Order mein)
    const HEADERS = ["EP No", "Sc No", "Time", "Location", "Sub-Loc", "Characters", "Props", "Synopsis", "Phone Talk"];
    
    // Editing ke liye fields jinko double click se edit karna hai
    const EDITABLE_FIELDS = ["EP No", "Time", "Location", "Sub-Loc", "Characters", "Props", "Synopsis", "Phone Talk"];

    // Function to update any field
    const handleCellChange = (sceneIndex, field, newValue) => {
        const dataKey = getDataKey(field); // Correct data key nikalen
        
        const updatedData = breakdownData.map((scene, i) => {
            if (i === sceneIndex) {
                const updates = { [dataKey]: newValue };
                if (field === "Synopsis") {
                    updates['Synopsis'] = newValue; // Update both keys
                    updates['Scene_Synopsis'] = newValue;
                } else if (field === "Phone Talk") {
                    updates['Phone_Talk'] = newValue;
                    updates['Phon Talk'] = newValue; 
                }
                
                return { ...scene, ...updates }; 
            }
            return scene;
        });
        setBreakdownData(updatedData);
    };

    // Naya aur behtar Editable Cell Component (Minimal Height Fix)
    const EditableCell = ({ value, sceneIndex, field }) => {
        const [isEditing, setIsEditing] = useState(false);
        const currentDataKey = getDataKey(field);
        const [inputValue, setInputValue] = useState(breakdownData[sceneIndex][currentDataKey] || value || ''); 

        const handleSave = () => {
            if (inputValue !== value) {
                handleCellChange(sceneIndex, field, inputValue); 
            }
            setIsEditing(false);
        };
        
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && field !== 'Synopsis') { 
                handleSave();
            }
        };

        const InputComponent = (field === "Synopsis" || field === "Characters" || field === "Props") ? 'textarea' : 'input'; 
        
        // Phone Talk ke liye Dropdown
        if (field === "Phone Talk") {
            return (
                <select 
                    value={inputValue}
                    onChange={(e) => { 
                        setInputValue(e.target.value);
                        handleCellChange(sceneIndex, field, e.target.value); // Save on change
                    }}
                    // ✅ py-0.5 is already minimal
                    className="w-full bg-blue-700 py-0.5 px-1 rounded border border-yellow-500 text-xs focus:outline-none"
                >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="N/A">N/A</option>
                </select>
            );
        }

        // Input/Textarea Component
        if (isEditing) {
            return (
                <InputComponent
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    rows={field === "Synopsis" ? 3 : 1}
                    className={`w-full bg-blue-700 py-0.5 px-1 rounded border border-yellow-500 text-xs focus:outline-none 
                        ${field === "Synopsis" ? 'resize-y min-h-[50px]' : 'resize-none'}`}
                />
            );
        }

        // Display <span> (Minimal Height Fix)
        return (
            <span 
                onDoubleClick={() => setIsEditing(true)} 
                title="Double click to edit"
                // ✅ UI FIX: py-[1px] for even more minimal height and leading-none for minimal line height
                className={`block cursor-pointer py-[1px] px-1 text-yellow-100 leading-none
                    ${field === "Synopsis" ? 'whitespace-pre-wrap' : 'whitespace-nowrap overflow-hidden text-ellipsis'}`}
            >
                {value || 'N/A'}
            </span>
        );
    };


    if (breakdownData.length === 0) {
        return <p className="text-gray-400 p-4">No scenes found. Upload a script above to add new scenes.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-700 border border-blue-700 table-fixed text-xs">
                <thead className="bg-blue-700/50 sticky top-0">
                    <tr>
                        {HEADERS.map((head) => ( 
                            <th 
                                key={head} 
                                // py-[4px] for a bit more space on header
                                className={`px-1 py-[4px] text-center font-bold text-yellow-300 border-r border-blue-700 bg-blue-800/80 uppercase tracking-wider
                                    // WIDTH LOGIC (Synopsis width increased)
                                    ${head === "EP No" || head === "Sc No" ? 'w-[40px]' : 
                                        head === "Time" || head === "Phone Talk" ? 'w-[60px]' : 
                                            head === "Location" || head === "Sub-Loc" ? 'w-[100px]' : 
                                                head === "Props" || head === "Characters" ? 'w-[140px]' :
                                                    head === "Synopsis" ? 'w-[250px]' : 'w-auto' 
                                    }`}
                                >
                                {head}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {breakdownData.map((scene, index) => (
                        <tr key={scene.id || index} className="border-t border-blue-700 hover:bg-blue-700/30 transition">
                            {HEADERS.map((header) => {
                                const dataKey = getDataKey(header); 
                                const value = header === "Synopsis" 
                                    ? scene.Synopsis || scene.Scene_Synopsis 
                                    : header === "Phone Talk" 
                                        ? scene['Phon Talk'] || scene.Phone_Talk
                                        : scene[dataKey]; 

                                const isEditable = EDITABLE_FIELDS.includes(header); 
                    
                                return (
                                    <td key={header} 
                                        // ✅ UI FIX: py-[1px] kiya (was py-[2px])
                                        className={`px-1 py-[1px] border-r border-blue-700 text-xs align-top ${isEditable ? '' : 'text-center whitespace-nowrap text-yellow-100'}`}
                                    > 
                                        {isEditable ? (
                                            <EditableCell 
                                                value={value} 
                                                sceneIndex={index} 
                                                field={header} 
                                            />
                                        ) : (
                                            // ✅ UI FIX: Non-editable cell ka padding aur line height bhi change kiya
                                            <span className="block py-[1px] leading-none">{value || '—'}</span> 
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};
// Base URL
const API_BASE_URL = 'http://localhost:5000';

function BreakdownEditor() {
    const { projectId } = useParams(); 
    
    const [project, setProject] = useState({ id: projectId, name: 'Loading...' });
    const [breakdownData, setBreakdownData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    const [newScenesToMerge, setNewScenesToMerge] = useState(null);

    // 2. Existing Project Data Fetch karna
    const fetchProjectData = useCallback(async () => {
        if (!projectId) return;

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/project/breakdown/${projectId}`);
            
            setProject({
                id: response.data.projectId,
                name: response.data.projectName,
            });
            // Ensure ID field exists for scheduling to work correctly
            const dataWithIDs = response.data.breakdown.map(scene => ({
                id: scene.id || scene._id.toString() || generateUniqueId(),
                ...scene
            }));
            
            setBreakdownData(dataWithIDs || []); 

        } catch (err) {
            console.error("Error fetching project:", err);
            setError('Failed to load project details. Check if project ID is correct and server is running.');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProjectData();
    }, [fetchProjectData]);


    // 3. Manual Editing ke baad data ko MongoDB mein Update karna
    const handleManualUpdate = async () => {
        setIsSaving(true);
        try {
            // ✅ PUT Route: /api/projects/:projectId (Yeh route schedule bhi sync karta hai)
            const response = await axios.put(`${API_BASE_URL}/api/projects/${projectId}`, {
                projectName: project.name, 
                breakdownData: breakdownData, // ✅ Poora update kiya hua data
            });
            
            alert(`Project '${response.data.project.projectName}' updated successfully, and schedule synced if exists!`);
            
        } catch (err) {
            console.error("Error saving manual changes:", err);
            alert(`Failed to save manual changes. Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSaving(false);
            setNewScenesToMerge(null);
        }
    };


    // 4. Naye Script se Breakdown laana aur Existing data mein Add karna
    const handleNewBreakdown = (newScenes) => {
        if (newScenes && newScenes.length > 0) {
            // Ensure new scenes have an 'id' field for scheduling
            const newScenesWithIDs = newScenes.map(scene => ({
                id: scene.id || scene._id.toString() || generateUniqueId(),
                ...scene
            }));
            
            // ✅ New scenes ko existing scenes ke saath jod dein (Append)
            const updatedBreakdown = [...breakdownData, ...newScenesWithIDs]; 
            
            setBreakdownData(updatedBreakdown);
            setNewScenesToMerge(newScenes); 
            
            alert(`Successfully added ${newScenes.length} new scenes. Please click 'Save Changes' to update the database.`);
        }
    };
    

    // --- RENDER LOGIC ---
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-blue-600 bg-blue-950">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <p className='text-gray-200'>Loading Project: {projectId}...</p> 
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-blue-950 min-h-[calc(100vh-4rem)] text-red-500">
                <AlertTriangle className="w-10 h-10 mb-4"/>
                <p className="text-xl font-bold">Error Loading Project</p>
                <p className="text-gray-400 mt-2">{error}</p>
            </div>
        );
    }
    
    return (
        <div className="p-8 bg-blue-950 min-h-[calc(100vh-4rem)] text-gray-100 max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold text-yellow-400 mb-2">
                Pre-Production Editor
            </h1>
            <h2 className="text-xl text-gray-400 mb-6">
                Project: <input 
                    type="text" 
                    value={project.name} 
                    onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-transparent border-b border-gray-500 focus:border-yellow-400 outline-none text-white font-bold transition"
                /> (ID: {projectId})
            </h2>

            {/* 1. New Script Uploader to Add Scenes */}
            <div className="mb-8 p-6 bg-blue-900 rounded-xl shadow-lg border border-blue-700">
                <h3 className="text-2xl font-bold text-yellow-300 mb-4 flex items-center">
                    <Upload className="w-6 h-6 mr-2" /> Add More Script / Scenes
                </h3>
                <UploadScript 
                    setBreakdownData={handleNewBreakdown}
                    isEditor={true} 
                />
            </div>
            
            {/* 2. Manual Save Button (Always show) */}
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-yellow-400 italic">
                    {newScenesToMerge ? `*${newScenesToMerge.length} new scenes added. Save required.` : ''}
                </p>
                <button
                    onClick={handleManualUpdate}
                    disabled={isSaving}
                    className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition duration-200 disabled:bg-gray-500"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" /> Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* 3. Editable Breakdown Table */}
            <div className="bg-blue-900 p-6 rounded-xl shadow-lg border border-blue-700">
                <h3 className="text-2xl font-bold text-yellow-300 mb-4">
                    Current Breakdown ({breakdownData.length} Scenes)
                </h3>
                <EditableBreakdownTable 
                    breakdownData={breakdownData} 
                    setBreakdownData={setBreakdownData}
                />
            </div>
        </div>
    );
}

export default BreakdownEditor;