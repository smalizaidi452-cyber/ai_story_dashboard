import { useState, useEffect } from "react";
import ProgressChart from "./ProgressChart";
import BudgetEstimator from "./BudgetEstimator";

export default function DashboardSummary() {
  const [breakdown, setBreakdown] = useState([]);

  useEffect(() => {
    // Mock Data (بعد میں Backend سے Connect ہوگا)
    const data = [
      { EP: 1, SC: 4, LOCATION: "Palace", TIME: "Day", COST: 30000 },
      { EP: 1, SC: 5, LOCATION: "Garden", TIME: "Night", COST: 18000 },
      { EP: 2, SC: 1, LOCATION: "Market", TIME: "Day", COST: 25000 },
      { EP: 2, SC: 2, LOCATION: "Palace", TIME: "Night", COST: 32000 },
    ];
    setBreakdown(data);
  }, []);

  const totalScenes = breakdown.length;
  const totalBudget = breakdown.reduce((a, b) => a + b.COST, 0);
  const dayScenes = breakdown.filter(b => b.TIME === "Day").length;
  const nightScenes = breakdown.filter(b => b.TIME === "Night").length;

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl text-aiGlow mb-6">🎬 AI Summary Dashboard</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="Total Scenes" value={totalScenes} />
        <SummaryCard title="Day Scenes" value={dayScenes} />
        <SummaryCard title="Night Scenes" value={nightScenes} />
        <SummaryCard title="Estimated Budget" value={`Rs ${totalBudget.toLocaleString()}`} />
      </div>

      <ProgressChart data={breakdown} />
      <BudgetEstimator data={breakdown} />
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="bg-aiDark p-4 rounded-2xl shadow-lg border border-aiGlow text-center">
      <h2 className="text-lg text-gray-300">{title}</h2>
      <p className="text-2xl text-aiGlow mt-1 font-semibold">{value}</p>
    </div>
  );
}
