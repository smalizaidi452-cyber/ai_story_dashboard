// frontend\src\pages\AIScriptDashboard.jsx
import React, { useState } from 'react';
import UploadScript from '../components/UploadScript';
import BreakdownTable from '../components/BreakdownTable';

const AIScriptDashboard = () => {
  // ✅ Temp breakdown state (Dashboard only)
  const [tempBreakdown, setTempBreakdown] = useState([]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="p-8 bg-blue-900 rounded-2xl shadow-xl border border-blue-800">
        <h1 className="text-3xl font-bold mb-4 text-yellow-400 border-b border-yellow-600 pb-3">
          AI Script Uploader & Breakdown
        </h1>

        {/* Upload Script Component */}
        <div className="bg-blue-800 rounded-xl p-6 mb-6 shadow-md border border-blue-700">
          <UploadScript tempBreakdownSetter={setTempBreakdown} />
        </div>

        {/* Temporary Breakdown Table */}
        {tempBreakdown && tempBreakdown.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">
              Newly Generated Breakdown (Unsaved)
            </h2>
            <BreakdownTable
              breakdownData={tempBreakdown}
              currentProjectName="New Upload (Unsaved)"
              selectedSceneIds={[]} // Dashboard case, no selection yet
              onSceneSelect={() => {}} // No-op
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIScriptDashboard;
