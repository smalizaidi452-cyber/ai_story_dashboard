// frontend\src\components\EditableBreakdownTable.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Edit, Save, XCircle } from 'lucide-react';

// جن فیلڈز کو آپ ایڈٹ کرنا چاہتے ہیں
const editableFields = [
    "Location", "Sub_Location", "Time", "Scene_Synopsis", "Characters", "Props"
];

const EditableBreakdownTable = ({ breakdownData, projectId, onDataUpdate }) => {
    // Editing state: { sceneId: { field: true } }
    const [isEditing, setIsEditing] = useState({});
    const [editValue, setEditValue] = useState('');
    const [currentlyEditing, setCurrentlyEditing] = useState({ id: null, field: null });

    // Cell Edit Mode Start
    const handleEditStart = (sceneId, field, currentValue) => {
        setIsEditing({ ...isEditing, [sceneId]: { ...isEditing[sceneId], [field]: true } });
        setCurrentlyEditing({ id: sceneId, field });
        setEditValue(currentValue || '');
    };

    // Cell Edit Mode Cancel
    const handleEditCancel = (sceneId, field) => {
        setIsEditing({ ...isEditing, [sceneId]: { ...isEditing[sceneId], [field]: false } });
        setCurrentlyEditing({ id: null, field: null });
        setEditValue('');
    };
    
    // Cell Edit Mode Save & API Call
    const handleEditSave = async (sceneId, field, originalValue) => {
        if (editValue === originalValue) {
            handleEditCancel(sceneId, field);
            return;
        }

        try {
            // Optimistic Update: Frontend mein data pehle update karen
            onDataUpdate(sceneId, field, editValue); 
            
            // Backend API Call (Assumes this endpoint is set up)
            await axios.put(`http://localhost:5000/api/project/update-breakdown/${projectId}`, {
                sceneId: sceneId,
                field: field,
                newValue: editValue,
            });

            console.log(`Updated scene ${sceneId}, field ${field} to ${editValue}`);
            
            // Reset state
            handleEditCancel(sceneId, field); 

        } catch (error) {
            console.error("Error updating breakdown:", error);
            alert(`Failed to save changes. Error: ${error.message}`);
            
            // Revert on failure (Pessimistic update)
            onDataUpdate(sceneId, field, originalValue); 
            handleEditCancel(sceneId, field);
        }
    };

    const isCellEditing = (sceneId, field) => currentlyEditing.id === sceneId && currentlyEditing.field === field;

    return (
        <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-blue-700 border-b pb-2">Editable Breakdown Data</h3>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-blue-100 text-blue-800 sticky top-0">
                    <tr>
                        <th className="px-4 py-3 text-left font-bold">EP No.</th>
                        <th className="px-4 py-3 text-left font-bold">SC No.</th>
                        {/* Editable Fields */}
                        <th className="px-4 py-3 text-left font-bold w-1/6">Location</th>
                        <th className="px-4 py-3 text-left font-bold w-1/6">Sub-Location</th>
                        <th className="px-4 py-3 text-left font-bold">Time</th>
                        <th className="px-4 py-3 text-left font-bold w-1/5">Synopsis</th>
                        <th className="px-4 py-3 text-left font-bold w-1/6">Characters</th>
                        <th className="px-4 py-3 text-left font-bold w-1/6">Props</th>
                        {/* Non-Editable Fields */}
                        <th className="px-4 py-3 text-left font-bold">Page</th>
                        <th className="px-4 py-3 text-left font-bold">Day/Night</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-gray-700">
                    {breakdownData.map((scene, index) => (
                        <tr key={scene._id || index} className="hover:bg-yellow-50 align-top">
                            <td className="px-4 py-2 font-bold whitespace-nowrap">{scene["EP No"] || '-'}</td>
                            <td className="px-4 py-2 font-bold text-red-600 whitespace-nowrap">{scene["Sc No"] || '-'}</td>

                            {editableFields.map((field) => (
                                <td key={field} className="px-4 py-2">
                                    {isCellEditing(scene._id, field) ? (
                                        // Edit Mode: Input Field and Controls
                                        <div className="flex flex-col space-y-1">
                                            <textarea
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="border border-yellow-500 p-1 w-full text-sm rounded focus:ring-2 focus:ring-yellow-700 resize-y"
                                                rows={field === "Scene_Synopsis" ? 3 : 1}
                                            />
                                            <div className='flex gap-1 justify-end'>
                                                <button 
                                                    onClick={() => handleEditSave(scene._id, field, scene[field])}
                                                    className="bg-green-500 text-white p-0.5 rounded hover:bg-green-600 transition"
                                                    title="Save"
                                                >
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleEditCancel(scene._id, field)}
                                                    className="bg-red-500 text-white p-0.5 rounded hover:bg-red-600 transition"
                                                    title="Cancel"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode: Display Value and Edit Button
                                        <div className="flex justify-between items-start group min-h-[40px] w-full">
                                            <span className='whitespace-pre-wrap flex-grow'>
                                                {scene[field] || '—'}
                                            </span>
                                            <button
                                                onClick={() => handleEditStart(scene._id, field, scene[field])}
                                                className="text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition duration-150 p-1"
                                                title="Edit Field"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            ))}

                            {/* Non-Editable fields display again */}
                            <td className="px-4 py-2 whitespace-nowrap">{scene.Page || '—'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{scene.Day_Night || '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EditableBreakdownTable;