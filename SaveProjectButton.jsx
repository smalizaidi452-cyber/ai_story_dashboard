// src/components/SaveProjectButton.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 🛑 Assumptions:
// 1. Aap ke paas ek API endpoint hai: '/api/projects/create'
// 2. Yeh endpoint POST request se project data leta hai.

function SaveProjectButton({ breakdownData, projectName, onSaveComplete }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSave = async () => {
        if (!breakdownData || breakdownData.length === 0) {
            setError("Breakdown data is empty. Nothing to save.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const projectPayload = {
            name: projectName || `New Project - ${new Date().toLocaleString()}`,
            scenes: breakdownData, // Assuming breakdownData is an array of scenes
            status: 'Draft',
            // Aap yahan koi aur data bhi shamil kar sakte hain, jese userId
        };

        try {
            // ✅ API Call: Data ko MongoDB mein save karna
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Agar aap authentication token istemal kar rahe hain, toh yahan shamil karein
                    // 'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(projectPayload),
            });

            if (!response.ok) {
                // Agar server side se error aaye
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save project on server.');
            }

            const savedProject = await response.json();
            
            // ✅ Success: Jab save ho jaye toh redirect karein
            console.log("Project saved successfully:", savedProject);
            
            // Optional: Parent component ko inform karein
            if (onSaveComplete) onSaveComplete(); 
            
            // ✅ Redirection: Naye Project List page par bhej dein
            navigate('/projects'); // <--- Naya Route '/projects' use hoga 

        } catch (err) {
            console.error("Save Error:", err.message);
            setError(err.message || 'An unexpected error occurred during save.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {error && (
                <p className="p-3 mb-4 bg-red-800 text-white rounded-md">
                    Error: {error}
                </p>
            )}

            <button
                onClick={handleSave}
                disabled={isLoading || !breakdownData || breakdownData.length === 0}
                className={`
                    px-8 py-3 text-lg font-semibold rounded-lg transition duration-200 
                    ${isLoading 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                    }
                `}
            >
                {isLoading ? 'Saving...' : '✅ Save New Project to Pre-Production'}
            </button>
        </div>
    );
}

export default SaveProjectButton;