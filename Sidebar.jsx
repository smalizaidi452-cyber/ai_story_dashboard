import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  LayoutDashboard, 
  Upload, 
  FileText, 
  ChevronRight, 
  FolderOpen
} from "lucide-react";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  // ✅ Breakdown route ko dynamic banaya gaya hai (last opened project ke liye)
  const lastProjectId = localStorage.getItem("lastOpenedProjectId");

  const menuItems = [
    { name: "Home", path: "/", icon: <Home size={20} /> },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Upload Script", path: "/ai-dashboard", icon: <Upload size={20} /> },
    { 
      name: "Breakdown", 
      path: lastProjectId ? `/project/${lastProjectId}/breakdown` : "/my-projects", 
      icon: <FileText size={20} /> 
    },
    { name: "My Projects", path: "/my-projects", icon: <FolderOpen size={20} /> },
  ];

  return (
    <div
      className={`h-screen bg-gray-900 text-gray-200 shadow-lg border-r border-gray-800 
      transition-all duration-300 ease-in-out fixed left-0 top-0 z-30`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        width: isExpanded ? "16rem" : "4rem",
      }}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <h1 className={`text-xl font-bold text-blue-400 transition-all ${!isExpanded && "opacity-0"}`}>
          AI Script Analyzer
        </h1>
        <ChevronRight 
          className={`text-gray-400 transform transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} 
        />
      </div>

      {/* Menu Items */}
      <ul className="mt-4">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={idx}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-md cursor-pointer
                  ${isActive ? "bg-gray-800 text-blue-400" : "hover:bg-gray-700 hover:text-blue-300"}`}
              >
                <span>{item.icon}</span>
                <span className={`text-sm font-medium transition-all duration-300 ${!isExpanded && "opacity-0"}`}>
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
