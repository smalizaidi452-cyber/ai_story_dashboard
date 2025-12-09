// C:\Users\Acer\Desktop\ai_story_dashboard\frontend\src\components\BreakdownTable.jsx (CORRECTED)

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { ArrowLeftRight } from "lucide-react";

const COLUMN_HEADINGS = [
  "EP No",
  "Sc No",
  "Time",
  "Location",
  "Sub_Location",
  "Characters",
  "Props",
  "Scene_Synopsis",
  "Phone_Talk",
];

// ✅ NEW HELPER COMPONENT: DetailItem for clean card rendering
const DetailItem = ({ label, value, isBold, isItalic, className }) => (
  <p className={`flex items-start text-[10px] leading-snug whitespace-normal break-words ${className}`}>
    <span className="font-medium text-yellow-400 mr-1">{label}:</span>
    <span
      className={`text-gray-100 ${isBold ? "font-semibold" : "font-normal"} ${
        isItalic ? "italic" : ""
      }`}
    >
      {value}
    </span>
  </p>
);


const BreakdownTable = ({
  breakdownData,
  currentProjectName,
  onSceneSelect,
  selectedSceneIds,
}) => {
  const [view, setView] = useState("table");

  const dataToRender = Array.isArray(breakdownData) ? breakdownData : [];

  const exportToExcel = () => {
    if (dataToRender.length === 0) {
      alert("No data available to export.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(dataToRender);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Breakdown Data");
    XLSX.writeFile(workbook, `Breakdown_${currentProjectName || "Data"}.xlsx`);
  };

  if (dataToRender.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 bg-blue-900 rounded-xl shadow-lg border border-blue-800 mt-8 max-w-full">
        <p className="text-xl font-medium text-yellow-400">
          No Breakdown Data Available.
        </p>
        <p className="text-sm mt-1">
          Please select a project or upload a script to generate the breakdown.
        </p>
      </div>
    );
  }

  const isSelectionEnabled =
    typeof onSceneSelect === "function" && Array.isArray(selectedSceneIds);

  // ✅ Generate reliable unique IDs for each scene
  const getSceneId = (scene, index) =>
    scene._id || `${scene["EP No"] || "EP"}-${scene["Sc No"] || "SC"}-${index}`;

  // ✅ Handle select all / clear all
  const handleSelectAll = () => {
    const allIds = dataToRender.map((scene, i) => getSceneId(scene, i));
    allIds.forEach((id) => onSceneSelect(id, true));
  };
  const handleClearAll = () => {
    selectedSceneIds.forEach((id) => onSceneSelect(id, false));
  };

  return (
    <div className="p-6 rounded-xl shadow-2xl bg-blue-900 border border-blue-800 print:p-0 print:shadow-none print:border-0 w-full">
      {/* Control Bar (print:hidden hai) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6 border-b border-yellow-600 pb-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-white">
            Breakdown Table for:{" "}
            <span className="text-yellow-400">
              {currentProjectName || "N/A"}
            </span>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isSelectionEnabled && (
            <>
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow"
              >
                Select All
              </button>
              <button
                onClick={handleClearAll}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow"
              >
                Clear All
              </button>
            </>
          )}
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-gray-900 rounded-lg shadow transition text-sm font-bold"
          >
            Export Breakdown ({dataToRender.length})
          </button>
          <button
            onClick={() => setView(view === "card" ? "table" : "card")}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-600 transition text-sm font-semibold"
          >
            <ArrowLeftRight className="w-4 h-4 inline mr-1.5" />
            {view === "card" ? "Table View" : "Card View"}
          </button>
        </div>
      </div>

      {/* Summary/Info Bar (print:hidden hai) */}
      <div className="text-sm text-gray-400 mb-4 bg-blue-800 p-3 rounded-lg border border-blue-700 print:hidden">
        <p className="font-semibold text-yellow-400">
          Total Scenes Displayed:{" "}
          <span className="text-white font-extrabold">
            {dataToRender.length}
          </span>
        </p>
        {isSelectionEnabled && (
          <p className="text-xs mt-1 text-gray-300">
            Select scenes using checkboxes to generate a Shooting Schedule.
          </p>
        )}
      </div>

      {view === "card" ? (
        // ***************** CARD VIEW (FIXED) *****************
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 w-full">
            {dataToRender.map((scene, index) => {
                const id = getSceneId(scene, index);
                const checked = selectedSceneIds.includes(id);

                return (
                    <div
                        key={id}
                        className={`bg-blue-800 border-t-4 ${
                            checked ? "border-green-500" : "border-yellow-600"
                        } rounded-xl shadow p-3 hover:shadow-xl text-[11px] text-gray-100 transition-shadow relative`}
                    >
                        {/* 1. CHECKBOX for Schedule (Card View) */}
                        {isSelectionEnabled && (
                            <input
                                type="checkbox"
                                checked={checked} 
                                onChange={(e) => onSceneSelect(id, e.target.checked)} 
                                className="absolute top-2 right-2 w-5 h-5 text-yellow-600 bg-blue-900 border-yellow-600 rounded focus:ring-yellow-500 cursor-pointer z-10 print:hidden" // 🛑 Print Fix for Card Checkboxes
                                title="Select for Shooting Schedule"
                            />
                        )}

                        {/* 2. HEADER */}
                        <div className="flex justify-between items-start mb-2 border-b border-blue-700 pb-1 pr-8">
                            <h3 className="text-sm font-bold text-yellow-400">
                                EP {scene["EP No"] || "N/A"} / SC {scene["Sc No"] || "N/A"}
                            </h3>
                            {/* Time of Day/Time Field */}
                            <span
                                className={`px-2 py-[1px] text-[10px] font-bold rounded-full uppercase ${
                                    // ✅ FIX: (scene.Time || "") use kiya taa-ke agar Time undefined ho to error na de
                                    (scene.Time || "").toLowerCase().includes("day") 
                                        ? "bg-yellow-600 text-gray-900" 
                                        : "bg-blue-700 text-white"
                                }`}
                            >
                                {scene.Time || "N/A"}
                            </span>
                        </div>
                        
                        {/* 3. BREAKDOWN DETAILS */}
                        <div className="space-y-1">
                            <DetailItem label="Location" value={scene.Location || "N/A"} />
                            <DetailItem label="Sub-Location" value={scene.Sub_Location || "N/A"} />
                            <DetailItem label="Characters" value={scene.Characters || "N/A"} isBold />
                            <DetailItem label="Props/Gears" value={scene.Props || "None"} isItalic />
                            <DetailItem label="Phone Talk" value={scene.Phone_Talk || "No"} isItalic />
                        </div>

                        {/* 4. SYNOPSIS */}
                        <div className="mt-2 pt-2 border-t border-blue-700">
                            <span className="font-semibold text-yellow-400 block mb-1 text-[10px]">Synopsis:</span>
                            <p className="text-[10px] text-gray-200 bg-blue-700 p-2 rounded-md leading-snug text-justify whitespace-normal break-words max-h-[60px] overflow-y-auto">
                                {scene.Scene_Synopsis || "No synopsis provided."}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
      ) : (
        // ***************** TABLE VIEW *****************
        <div className="overflow-x-auto mt-6 w-full">
          <table className="border-collapse border border-blue-700 text-[10px] w-full table-fixed text-gray-100 shadow-xl">
            <thead className="bg-yellow-600 text-gray-900 font-bold sticky top-0">
              <tr>
                {isSelectionEnabled && (
                  <th className="px-1 py-[4px] border border-gray-900 w-[3%] print:hidden">
                    Sel
                  </th>
                )}
                {COLUMN_HEADINGS.map((heading) => (
                  <th
                    key={heading}
                    className="px-1 py-[4px] border border-gray-900"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-blue-900">
              {dataToRender.map((scene, index) => {
                const id = getSceneId(scene, index);
                const checked = selectedSceneIds.includes(id);
                return (
                  <tr
                    key={id}
                    className={`hover:bg-blue-800 transition-colors border-t border-blue-700 align-top ${
                      checked ? "bg-green-800/40" : ""
                    }`}
                  >
                    {isSelectionEnabled && (
                      <td className="px-1 py-[2px] border border-blue-700 text-center print:hidden">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => onSceneSelect(id, e.target.checked)}
                          className="w-4 h-4 text-yellow-600 bg-blue-900 border-yellow-600 rounded focus:ring-yellow-500 cursor-pointer"
                          title="Select for Shooting Schedule"
                        />
                      </td>
                    )}
                    <td className="px-1 py-[2px] border border-blue-700 text-center">
                      {scene["EP No"] || "—"}
                    </td>
                    <td className="px-1 py-[2px] border border-blue-700 text-center">
                      {scene["Sc No"] || "—"}
                    </td>
                    <td className="px-1 py-[2px] border border-blue-700 text-center">
                      {scene.Time || "—"}
                    </td>
                    <td className="px-1 py-[2px] border border-blue-700">
                      {scene.Location || "—"}
                    </td>
                    <td className="px-1 py-[2px] border border-blue-700">
                      {scene.Sub_Location || "—"}
                    </td>
                    <td className="px-1 py-[2px] border border-blue-700 text-yellow-400 font-semibold">
                      {scene.Characters || "—"}
                    </td>
                    <td className="px-1 py-[2px] border border-blue-700 italic">
                      {scene.Props || "—"}
                    </td>
                    <td className="px-1 py-[2px] border border-blue-700 text-justify">
                      {scene.Scene_Synopsis || "—"}
                    </td>
                    <td className="px-1 py-[2px] border border-blue-700 text-center">
                      {scene.Phone_Talk === "Yes" ? "📞" : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BreakdownTable;