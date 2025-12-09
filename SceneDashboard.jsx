import { useState, useEffect } from "react";
import axios from "axios";

export default function SceneDashboard() {
  const [scenes, setScenes] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/scenes").then((res) => setScenes(res.data));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        🎬 Scene Breakdown Manager
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              {[
                "S.No","EP","SC","Time","Day","Location","Character","Synopsis",
                "Props","Page","Talk","Flashback","Schedule Date","Recorded Date"
              ].map((head) => (
                <th key={head} className="border px-2 py-1">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenes.map((scene, i) => (
              <tr key={i} className="text-center border-t">
                <td className="border px-2 py-1">{i + 1}</td>
                {Object.keys(scene).slice(1).map((key, j) => (
                  <td key={j} className="border px-2 py-1">{scene[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
