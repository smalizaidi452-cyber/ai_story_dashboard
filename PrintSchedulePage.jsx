import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Agar aap React Router use kar rahe hain
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; 
// Note: Is API endpoint ko aapko server pe banana padega!

const PrintSchedulePage = () => {
    // 1. URL se parameters nikalna
    // Yeh "projectId" aur "dayId" woh naam hain jo hum Step 2.3 mein define karenge.
    const { projectId, dayId } = useParams(); 
    
    const [dayData, setDayData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Data Fetching
    useEffect(() => {
        const fetchDaySchedule = async () => {
            if (!projectId || !dayId) {
                setError("Project ID or Day ID is missing in the URL.");
                setLoading(false);
                return;
            }

            try {
                // NEW API endpoint: Server se sirf us day ka data maangna
                const response = await axios.get(`${API_BASE_URL}/api/schedule/load/day/${projectId}/${dayId}`);
                
                // Server se aane waale data mein day ka naam, date aur scenes honge.
                setDayData(response.data); 
                
                // Data load hone ke baad print dialogue box kholna
                // Chooinki yeh ek naye tab mein khula hai, window.print() theek kaam karega.
                setTimeout(() => {
                    window.print(); 
                }, 500); // Thoda delay taa-ke component render ho jaye

            } catch (err) {
                console.error("Failed to load print schedule data:", err);
                setError("Error loading schedule. Check API endpoint.");
            } finally {
                setLoading(false);
            }
        };

        fetchDaySchedule();
    }, [projectId, dayId]);

    if (loading) return <div className="p-8 text-center text-lg">Loading Print Preview...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!dayData || !dayData.scenes || dayData.scenes.length === 0) return (
        <div className="p-8 text-center text-gray-500">No scenes found for this day.</div>
    );
    
    // 3. Print-Friendly Rendering
    // Print ke liye, aapko wohi SceneRow/TABLE_HEADERS use karna chahiye jo aapne ShootingSchedulePage mein kiye thay.
    // (Aapko TABLE_HEADERS aur SceneRow ko import/copy karna padega)
    
    return (
        <div className="p-4 print:p-0"> {/* print:p-0 removes padding in print view */}
            <h1 className="text-2xl font-bold mb-2">
                Print Schedule: {dayData.dayName} 
            </h1>
            <p className="mb-4">Date: {dayData.date || 'TBD'} | Project ID: {projectId}</p>

            {/* Print Table rendering logic here (Use a simple, clean table) */}
            <table className="w-full text-left border-collapse border border-gray-400">
                <thead>
                    <tr>
                        {/* Print Page ke liye sirf zaroori columns dikhayein */}
                        <th className="p-2 border border-gray-400">EP/SC</th>
                        <th className="p-2 border border-gray-400">Time</th>
                        <th className="p-2 border border-gray-400">Location/Sub-Loc</th>
                        <th className="p-2 border border-gray-400">Characters</th>
                        <th className="p-2 border border-gray-400">Synopsis</th>
                    </tr>
                </thead>
                <tbody>
                    {dayData.scenes.map(scene => (
                        <tr key={scene.id} className="border-t border-gray-300">
                            <td className="p-2 border border-gray-400 text-sm">{scene['EP No']}/{scene['Sc No']}</td>
                            <td className="p-2 border border-gray-400 text-sm">{scene.Time}</td>
                            <td className="p-2 border border-gray-400 text-sm">{scene.Location} / {scene.Sub_Location}</td>
                            <td className="p-2 border border-gray-400 text-sm">{scene.Characters}</td>
                            <td className="p-2 border border-gray-400 text-sm max-w-xs">{scene.Scene_Synopsis}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Print button on screen, hidden in print view */}
            <button 
                onClick={() => window.print()}
                className="mt-6 p-3 bg-blue-600 text-white rounded print:hidden"
            >
                Print Schedule Now
            </button>
        </div>
    );
};

export default PrintSchedulePage;