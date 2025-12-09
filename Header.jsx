// ✅ frontend/src/components/Header.jsx (FINAL STRUCTURE UPDATE)

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    Home, 
    FileText, 
    FolderOpen, 
    Film, 
    BarChart3,
    UploadCloud, // New Upload Icon
    Calendar,    // Calendar for Schedule/Planning
    Users,       // For Talent/Crew (Portfolio)
    ListChecks   // For Production/Shooting Record
} from 'lucide-react';

const Header = () => {
    const location = useLocation();
    
    // Check agar path kisi bhi child route se match karta hai
    const isLinkActive = (path) => location.pathname.startsWith(path);

    const navItemClasses = (isActive) => 
        `px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 hover:text-yellow-400 text-sm transition font-semibold ${
            isActive ? 'bg-yellow-600 text-gray-900' : 'text-gray-200'
        }`;
        
    const dropdownItemClasses = "block px-4 py-2 hover:bg-blue-800 hover:text-yellow-400 whitespace-nowrap text-sm";
    const dropdownMenuClasses = "absolute hidden group-hover:block bg-blue-900 rounded-lg shadow-2xl mt-2 w-max min-w-[250px] border border-yellow-600 z-50 transition-all duration-300 ease-in-out";
    const dropdownButtonClasses = (isActive) => 
        `px-4 py-2 rounded-lg flex items-center hover:bg-blue-800 hover:text-yellow-400 text-sm transition font-semibold ${
            isActive ? 'bg-yellow-600 text-gray-900' : 'text-gray-200'
        }`;

    return (
        <header className="bg-blue-950 shadow-lg border-b border-yellow-600 sticky top-0 z-50">
            <div className="max-w-full mx-auto px-6 flex justify-between items-center h-16">
                
                {/* Logo / App Name */}
                <Link to="/" className="flex items-center text-2xl font-extrabold text-yellow-400 hover:text-yellow-300 transition">
                    <FileText className="w-6 h-6 mr-2" />
                    Reel Mind AI
                </Link>

                {/* Navigation */}
                <nav className="flex space-x-2">
                    
                    {/* 1. Home */}
                    <Link to="/" className={navItemClasses(location.pathname === '/')}>
                        <Home className="w-4 h-4 mr-1.5" />
                        Home
                    </Link>

                    {/* 2. Pre-Production (Dropdown) */}
                    <div className="relative group">
                        <button className={dropdownButtonClasses(isLinkActive('/dashboard') || isLinkActive('/projects') || isLinkActive('/planning'))}>
                            <Film className="w-4 h-4 mr-1.5" />
                            Pre-Production
                        </button>

                        <div className={dropdownMenuClasses}>
                            {/* NOTE: /dashboard is where UploadScript component lives */}
                            <Link to="/dashboard" className={dropdownItemClasses}><UploadCloud className="w-4 h-4 inline mr-2"/> 📄 Upload Script</Link>
                            <Link to="/projects" className={dropdownItemClasses}><FolderOpen className="w-4 h-4 inline mr-2"/> 📄 Breakdown List</Link>
                            
                            {/* --- Planning Group --- */}
                            <div className="border-t border-blue-800 my-1"></div>
                            <span className="block px-4 py-1 text-xs font-bold text-yellow-500 uppercase">Scheduling & Planning</span>
                            
                            <Link to="/projects" className={dropdownItemClasses}><Calendar className="w-4 h-4 inline mr-2"/> 📄 Planning (Main Hub)</Link>
                            <Link to="/planning/schedule-plan" className={dropdownItemClasses}><Calendar className="w-4 h-4 inline mr-2"/> 📄 Shooting Schedule Plan</Link>
                            <Link to="/planning/availability" className={dropdownItemClasses}><Users className="w-4 h-4 inline mr-2"/> 📄 Location And Characters Available Dates Entry</Link>
                            <Link to="/planning/auto-schedule" className={dropdownItemClasses}><Calendar className="w-4 h-4 inline mr-2"/> 📄 Automatically Shooting Schedule</Link>
                        </div>
                    </div>

                    {/* 3. Productions (Dropdown) */}
                    <div className="relative group">
                        <button className={dropdownButtonClasses(isLinkActive('/production'))}>
                            <ListChecks className="w-4 h-4 mr-1.5" />
                            Production
                        </button>
                        <div className={dropdownMenuClasses}>
                            <Link to="/production/schedule-record" className={dropdownItemClasses}>📄 After Shooting Data Entry Schedule Plan Done Or Not</Link>
                            <Link to="/production/record-breakdown" className={dropdownItemClasses}>📄 Shooting Record Breakdown with Editable</Link>
                            <Link to="/production/realtime-feedback" className={dropdownItemClasses}>📄 Real Time Feed Back Record with Editable</Link>
                            <Link to="/production/suggestion" className={dropdownItemClasses}>📄 Shooting Suggestion</Link>
                        </div>
                    </div>
                    
                    {/* 4. Reports Summary (Dropdown) */}
                    <div className="relative group">
                        <button className={dropdownButtonClasses(isLinkActive('/reports'))}>
                            <BarChart3 className="w-4 h-4 mr-1.5" />
                            Reports Summery
                        </button>
                        <div className={dropdownMenuClasses}>
                            <Link to="/reports/location" className={dropdownItemClasses}>📄 Location Summery</Link>
                            <Link to="/reports/sub-location" className={dropdownItemClasses}>📄 Sub-Location Summery</Link>
                            <Link to="/reports/characters" className={dropdownItemClasses}>📄 Characters Summery</Link>
                            <Link to="/reports/props" className={dropdownItemClasses}>📄 Props Summery</Link>
                        </div>
                    </div>

                    {/* 5. Portfolio (Dropdown) */}
                    <div className="relative group">
                        <button className={dropdownButtonClasses(isLinkActive('/portfolio'))}>
                            <Users className="w-4 h-4 mr-1.5" />
                            Portfolio
                        </button>
                        <div className={dropdownMenuClasses}>
                            <Link to="/portfolio/crew" className={dropdownItemClasses}>📄 Crew Record</Link>
                            <Link to="/portfolio/talent" className={dropdownItemClasses}>📄 Telant Record</Link>
                            <Link to="/portfolio/management" className={dropdownItemClasses}>📄 Management Record</Link>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;