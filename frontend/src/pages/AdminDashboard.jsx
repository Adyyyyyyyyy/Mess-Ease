import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

function AdminDashboard() {
  const [data, setData] = useState({
    people: 0,
    wait: "",
    crowd: ""
  });

  const [chartData, setChartData] = useState([]);

  // 🔥 FETCH DATA FROM BACKEND
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = () => {
    fetch("http://127.0.0.1:8000/mess-status")
      .then(res => res.json())
      .then(res => {
        setData({
          people: res.people,
          wait: res.wait,
          crowd: res.crowd
        });
        setChartData(res.history);
      });
  };

  // 🔥 BUTTON FUNCTIONS
  const triggerFresh = () => {
    fetch("http://127.0.0.1:8000/fresh-batch");
  };

  const triggerEnding = () => {
    fetch("http://127.0.0.1:8000/food-ending");
  };

  const increaseCrowd = () => {
    const newPeople = data.people + 10;

    fetch(`http://127.0.0.1:8000/update-count?people=${newPeople}`)
      .then(fetchData);
  };

  const resetData = () => {
    fetch("http://127.0.0.1:8000/update-count?people=0")
      .then(fetchData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-8 py-4 bg-white/60 backdrop-blur-lg border-b shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-lg">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            ⚙️
          </div>
          Mess-Ease Admin
        </div>

        <div className="flex gap-6 text-gray-600 font-medium">
          <span className="hover:text-indigo-600 cursor-pointer transition">Dashboard</span>
          <span className="hover:text-indigo-600 cursor-pointer transition">Analytics</span>
          <span className="hover:text-indigo-600 cursor-pointer transition">Alerts</span>
        </div>
      </div>

      {/* HERO */}
      <div className="text-center py-14">
        <h1 className="text-5xl font-extrabold text-gray-900">
          Control Everything. Instantly.
        </h1>
        <p className="text-gray-600 mt-4 max-w-xl mx-auto">
          Manage live crowd, trigger updates, and monitor trends in real-time —
          all from one powerful control center.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">

        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
          <p className="text-gray-500 mb-2">👥 Active Users</p>
          <h2 className="text-4xl font-bold text-indigo-600">{data.people}</h2>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
          <p className="text-gray-500 mb-2">⏱ Avg Wait Time</p>
          <h2 className="text-4xl font-bold text-purple-600">{data.wait}</h2>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
          <p className="text-gray-500 mb-2">🔥 Crowd Status</p>
          <h2 className="text-4xl font-bold text-red-500">{data.crowd}</h2>
        </div>

      </div>

      {/* ACTION PANEL */}
      <div className="max-w-5xl mx-auto mt-14 bg-white rounded-2xl shadow-xl p-8">

        <h2 className="text-2xl font-semibold text-center mb-8">
          Control Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          <button onClick={triggerFresh}
            className="bg-gradient-to-r from-green-400 to-green-600 text-white py-3 rounded-xl shadow-md hover:scale-105 transition">
            🍽 Fresh Food
          </button>

          <button onClick={triggerEnding}
            className="bg-gradient-to-r from-red-400 to-red-600 text-white py-3 rounded-xl shadow-md hover:scale-105 transition">
            ⚠ Food Ending
          </button>

          <button onClick={increaseCrowd}
            className="bg-gradient-to-r from-indigo-400 to-indigo-600 text-white py-3 rounded-xl shadow-md hover:scale-105 transition">
            📊 Increase Crowd
          </button>

          <button onClick={resetData}
            className="bg-gradient-to-r from-gray-600 to-gray-800 text-white py-3 rounded-xl shadow-md hover:scale-105 transition">
            🔄 Reset
          </button>

        </div>
      </div>

      {/* GRAPH */}
      <div className="max-w-6xl mx-auto mt-16 px-6">

        <h2 className="text-3xl font-bold text-center mb-8">
          Live Activity Trends
        </h2>

        <div className="bg-white rounded-2xl p-8 shadow-xl">

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="people"
                stroke="#6366f1"
                strokeWidth={4}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;