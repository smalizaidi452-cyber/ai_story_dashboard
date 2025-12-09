export default function BudgetEstimator({ data }) {
  const totalCost = data.reduce((a, b) => a + b.COST, 0);
  const avgSceneCost = (totalCost / data.length).toFixed(0);

  return (
    <div className="bg-aiDark p-6 rounded-2xl mt-8 border border-gray-700">
      <h2 className="text-xl text-aiGlow mb-4">💰 AI Budget Estimator</h2>
      <p className="text-gray-300 mb-2">Total Estimated Budget: <span className="text-aiGlow font-bold">Rs {totalCost.toLocaleString()}</span></p>
      <p className="text-gray-300">Average Scene Cost: <span className="text-aiGlow font-bold">Rs {avgSceneCost}</span></p>
      <p className="text-gray-400 text-sm mt-2">💡 (یہ اعداد و شمار Breakdown Table کے COST ڈیٹا پر مبنی ہیں)</p>
    </div>
  );
}
