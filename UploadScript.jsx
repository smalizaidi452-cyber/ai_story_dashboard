// C:\Users\Acer\Desktop\ai_story_dashboard\frontend\src\components\UploadScript.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom'; 

const UploadScript = ({ setBreakdownData, isEditor = false }) => { 
    const [selectedFile, setSelectedFile] = useState(null);
    const [projectName, setProjectName] = useState(''); 
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    // useLocation is not needed here anymore

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage('');
        setIsSuccess(false);
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        
        // Validation: Project Name sirf tab lazmi hai jab Editor Mode mein na ho
        if (!selectedFile || (!isEditor && !projectName.trim())) {
            setMessage('Please select a PDF script and enter a Project Name (if starting a new project).');
            setIsSuccess(false);
            return;
        }

        setLoading(true);
        setMessage('Processing script with Gemini AI... Please wait, this may take a moment.');
        
        const formData = new FormData();
        formData.append('scriptFile', selectedFile);
        
        // ✅ 1. API Endpoint ka Faisla
        const apiEndpoint = isEditor 
            ? 'http://localhost:5000/api/generate-breakdown' // Non-Saving Route for Merging
            : 'http://localhost:5000/api/breakdown'; // Saving Route for New Project (Dashboard)
        
        // ✅ 2. Project Name sirf Saving Route ke liye bhejen
        if (!isEditor) {
            formData.append('projectName', projectName.trim());
        }

        try {
            
            const response = await axios.post(apiEndpoint, formData, { // 👈 Ab Sahi Endpoint use ho raha hai
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 300000
            });

            // response.data mein ab sirf 'breakdown' data aayega (projectId sirf /api/breakdown se aata hai)
            const newBreakdownData = response.data.breakdown;

            if (newBreakdownData && typeof setBreakdownData === 'function') {
                
                // ✅ BreakdownEditor.jsx mein merging ke liye data bhej diya
                setBreakdownData(newBreakdownData);

                // ✅ Message ko use case ke mutabiq define karen
                const successMsg = isEditor
                    ? '✅ Breakdown generated! New scenes merged into the current project (Click "Save Changes" to finalize).'
                    : '✅ Breakdown successful! Project created and displayed on Dashboard.';
                    
                setMessage(successMsg);
                setIsSuccess(true);

                // Agar dashboard par hain, to ho sakta hai humein project list update karni ho ya navigate karna ho.
                // Filhaal, hum sirf yeh assume kar rahe hain ke setBreakdownData hi Dashboard par kaafi hai.
            } else {
                setMessage('❌ Error: Breakdown data was empty or invalid.');
                setIsSuccess(false);
            }
            
        } catch (error) {
            console.error('Upload Error:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred during breakdown.';
            setMessage(`❌ Error: ${errorMessage}`);
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };
    
    // 💡 Project Name input field ko wapis return block mein use kar len.
    
    return (
        <div className="p-6 shadow-xl rounded-lg w-full text-gray-100">
            <form onSubmit={handleUpload}>
                
                {!isEditor && ( 
                    <div className="mb-4">
                        <label htmlFor="projectName" className="block text-sm font-medium text-yellow-400 mb-1">
                            Project Name (e.g., My Dream)
                        </label>
                        <input
                            type="text"
                            id="projectName"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Enter project name"
                            className="w-full p-3 bg-blue-900 border border-blue-700 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-yellow-600 focus:border-yellow-600 outline-none"
                            required={!isEditor} 
                            disabled={loading}
                        />
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="scriptFile" className="block text-sm font-medium text-yellow-400 mb-1">
                        Upload PDF Script
                    </label>
                    <input
                        type="file"
                        id="scriptFile"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="w-full p-3 bg-blue-900 border border-blue-700 rounded-lg text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-yellow-600 file:text-gray-900 hover:file:bg-yellow-500 cursor-pointer"
                        required
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    className={`w-full py-3 px-4 rounded-lg text-gray-900 font-bold transition duration-200 shadow-lg ${
                        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-500'
                    }`}
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing Breakdown...
                        </div>
                    ) : (
                        'Start Breakdown'
                    )}
                </button>
            </form>

            {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                    isSuccess 
                        ? 'bg-green-800 text-green-200 border border-green-700' 
                        : 'bg-red-800 text-red-200 border border-red-700'
                }`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default UploadScript;