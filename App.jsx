import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './components/HomePage';
import UploadScript from './components/UploadScript';
import BreakdownTable from './components/BreakdownTable';
// ✅ Zaroori Imports
import ProductionPlanningPage from './pages/ProductionPlanningPage';
import BreakdownListPage from './pages/BreakdownList';
import BreakdownEditor from "./pages/BreakdownEditor";
import ShootingSchedulePage from './pages/ShootingSchedulePage';
import PrintSchedulePage from './pages/PrintSchedulePage';
import SaveProjectButton from './components/SaveProjectButton';
import { AlertTriangle } from 'lucide-react';

// === TEMP PLACEHOLDERS FOR NEW PAGES ===
// NOTE: Jab aap yeh pages banayenge, to inko actual files se replace karen.
const PlaceholderPage = ({ title }) => (
    <div className="max-w-7xl mx-auto p-8 text-center bg-blue-900 rounded-xl m-8">
        <h1 className="text-3xl font-bold text-yellow-400">{title}</h1>
        <p className="text-gray-300 mt-2">This page is under development. Please define its content.</p>
    </div>
);
const PlanningPagePlaceholder = () => <PlaceholderPage title="Planning Page Under Construction" />;
const ProductionPagePlaceholder = () => <PlaceholderPage title="Production Page Under Construction" />;
const ReportsPagePlaceholder = () => <PlaceholderPage title="Reports Summary Page Under Construction" />;
const PortfolioPagePlaceholder = () => <PlaceholderPage title="Portfolio Page Under Construction" />;
// ======================================


// ✅ AI Script Dashboard (Updated Version - Upload & Breakdown)
function AIScriptDashboard() {
    const [tempBreakdown, setTempBreakdown] = useState(null);
    const [projectName, setProjectName] = useState(''); 
    // New state for scene selection (required by BreakdownTable)
    const [selectedScenes, setSelectedScenes] = useState([]);

    const handleSaveComplete = () => {
        setTempBreakdown(null);
        setProjectName('');
        setSelectedScenes([]); // Clear selection after save
    };
    
    // Function required by BreakdownTable, but only used in planning routes
    const handleSceneSelect = () => { /* Dummy function */ }; 

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="p-8 bg-blue-900 rounded-2xl shadow-xl border border-blue-800">
                
                <h1 className="text-3xl font-bold mb-4 text-yellow-400 border-b border-yellow-600 pb-3">
                    AI Script Uploader & Breakdown
                </h1>
                
                <div className="bg-blue-800 rounded-xl p-6 mb-6 shadow-md border border-blue-700">
                    <UploadScript setBreakdownData={setTempBreakdown} />
                </div>

                {tempBreakdown && tempBreakdown.length > 0 && (
                    <div className="mt-8 p-6 bg-blue-800 rounded-xl shadow-lg border border-blue-700">
                        <h2 className="text-2xl font-bold mb-4 text-yellow-400 border-b border-yellow-600 pb-2">
                            Newly Generated Breakdown
                        </h2>
                        
                        <div className="mb-6">
                            <label htmlFor="projectName" className="block text-gray-300 font-medium mb-2">
                                Project Name:
                            </label>
                            <input
                                id="projectName"
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Enter a name for this new project (e.g., 'Pilot Episode')"
                                className="w-full p-3 bg-blue-700 border border-blue-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>

                        <div className="mb-8">
                            <SaveProjectButton
                                breakdownData={tempBreakdown}
                                projectName={projectName}
                                onSaveComplete={handleSaveComplete}
                            />
                        </div>
                        
                        <BreakdownTable
                            breakdownData={tempBreakdown}
                            allProjects={[]}
                            currentProjectName={projectName || "New Upload (Unsaved)"}
                            // ✅ FIXES: Dummy props for the newly uploaded breakdown view
                            selectedSceneIds={selectedScenes} 
                            onSceneSelect={handleSceneSelect} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// ✅ 404 Not Found Component
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-gray-400 bg-blue-950">
    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
    <h2 className="text-3xl font-bold text-yellow-400">404 - Page Not Found</h2>
    <p className="mt-2 text-xl">
      The path you requested does not exist. (Check the URL in the address bar)
    </p>
    <p className="text-sm mt-1">Please use the links in the header.</p>
  </div>
);

// ✅ App Router (Updated with All New Routes)
function App() {
    return (
        <Router>
            <Header />
            <main className="w-full min-h-[calc(100vh-4rem)] bg-blue-950 text-gray-100 overflow-y-auto">
                <Routes>
                    {/* 1. 🏠 Home */}
                    <Route path="/" element={<HomePage />} /> 

                    {/* 2. PRE-PRODUCTION Section */}
                    {/* Upload Script */}
                    <Route path="/dashboard" element={<AIScriptDashboard />} />
                    
                    {/* Main Projects Hub */}
                    <Route path="/projects" element={<BreakdownListPage />} />
                    
                    {/* Project Specific Routes */}
                    <Route path="/projects/:projectId/breakdown" element={<BreakdownEditor />} />
                    <Route path="/projects/:projectId/planning" element={<ProductionPlanningPage />} />
                    {/* 2.1. Planning Sub-Section (Using placeholders for new routes) */}
                    <Route path="/planning/schedule-plan" element={<PlanningPagePlaceholder />} />
                    <Route path="/planning/availability" element={<PlanningPagePlaceholder />} />
                    <Route path="/planning/auto-schedule" element={<PlanningPagePlaceholder />} />

                    {/* Old Routes Retained/Redirected */}
                    <Route path="/schedule" element={<ShootingSchedulePage />} />
                    <Route path="/schedule/print/:projectId/:dayId" element={<PrintSchedulePage />} />
                    <Route path="/production-planning/:projectId" element={<ProductionPlanningPage />} />
                    <Route path="/upload" element={<Navigate to="/dashboard" replace />} />

                    {/* 3. PRODUCTIONS Section */}
                    <Route path="/production/schedule-record" element={<ProductionPagePlaceholder />} />
                    <Route path="/production/record-breakdown" element={<ProductionPagePlaceholder />} />
                    <Route path="/production/realtime-feedback" element={<ProductionPagePlaceholder />} />
                    <Route path="/production/suggestion" element={<ProductionPagePlaceholder />} />

                    {/* 4. REPORTS SUMMERY Section */}
                    <Route path="/reports/location" element={<ReportsPagePlaceholder />} />
                    <Route path="/reports/sub-location" element={<ReportsPagePlaceholder />} />
                    <Route path="/reports/characters" element={<ReportsPagePlaceholder />} />
                    <Route path="/reports/props" element={<ReportsPagePlaceholder />} />

                    {/* 5. PORTFOLIO Section */}
                    <Route path="/portfolio/crew" element={<PortfolioPagePlaceholder />} />
                    <Route path="/portfolio/talent" element={<PortfolioPagePlaceholder />} />
                    <Route path="/portfolio/management" element={<PortfolioPagePlaceholder />} />
                    <Route path="/portfolio" element={<Navigate to="/portfolio/crew" replace />} />

                    {/* ❌ 404 Page (Always last) */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;