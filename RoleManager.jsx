// src/components/RoleManager.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function RoleManager() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "Director" });

  const getUsers = async () => {
    const res = await axios.get("http://localhost:5000/users/allUsers");
    setUsers(res.data);
  };

  const addUser = async () => {
    await axios.post("http://localhost:5000/users/addUser", form);
    getUsers();
  };

  useEffect(() => { getUsers(); }, []);

  return (
    <div className="p-6 bg-aiDark text-white rounded-xl">
      <h2 className="text-aiGlow text-2xl mb-4 font-semibold">👥 Team Management</h2>
      
      <div className="flex gap-2 mb-4">
        <input className="p-2 rounded bg-gray-800" placeholder="Name" onChange={e => setForm({...form, name:e.target.value})}/>
        <input className="p-2 rounded bg-gray-800" placeholder="Email" onChange={e => setForm({...form, email:e.target.value})}/>
        <select className="p-2 rounded bg-gray-800" onChange={e => setForm({...form, role:e.target.value})}>
          <option>Director</option>
          <option>Crew</option>
          <option>Viewer</option>
        </select>
        <button onClick={addUser} className="bg-aiBlue px-4 py-2 rounded hover:bg-aiGlow">Add</button>
      </div>

      <table className="w-full border border-aiGlow rounded-xl text-sm">
        <thead className="bg-aiBlue bg-opacity-30">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} className="border-t border-gray-700 hover:bg-gray-800">
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2 text-aiGlow">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
