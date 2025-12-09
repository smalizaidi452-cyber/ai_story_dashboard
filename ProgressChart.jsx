import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function ProgressChart({ data }) {
  return (
    <div className="bg-aiDark p-6 rounded-2xl mt-8 border border-gray-700 shadow-xl">
      <h2 className="text-xl text-aiGlow mb-4">📈 Scene Distribution by Location</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="LOCATION" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Bar dataKey="COST" fill="#00FFFF" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
