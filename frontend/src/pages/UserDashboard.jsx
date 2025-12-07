import React, { useEffect, useState } from "react";
import {
  BellIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  UsersIcon,
  ExclamationIcon,
} from "@heroicons/react/outline";
import { FiPlus, FiMessageCircle } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Note: This file is built for a Tailwind CSS + React project.
// Recommended packages to install in your project:
// npm install recharts react-icons @heroicons/react

// Mock data (replace with your API responses)
const mockUser = {
  name: "Amit Kumar",
  email: "amitk060307@gmail.com",
  role: "Admin",
};

const mockAssignments = [
  {
    id: 1,
    title: "Replace AC Filter - Block A",
    status: "in-progress",
    dueDate: "2025-12-08",
    priority: "medium",
    location: "Block A",
  },
  {
    id: 2,
    title: "Restore Backup Power - Dock 3",
    status: "open",
    dueDate: "2025-12-06",
    priority: "high",
    location: "Dock 3",
  },
  {
    id: 3,
    title: "Network outage - Floor 5",
    status: "completed",
    dueDate: "2025-12-02",
    priority: "high",
    location: "Floor 5",
  },
  {
    id: 4,
    title: "Leakage in Roof Panel - Sector 7",
    status: "open",
    dueDate: "2025-12-10",
    priority: "low",
    location: "Sector 7",
  },
];

const mockEngineers = [
  {
    id: 1,
    name: "Chetan",
    skill: ["Electrical"],
    status: "available",
    avatarColor: "bg-cyan-400",
  },
  {
    id: 2,
    name: "Pawan",
    skill: ["Mechanical"],
    status: "busy",
    avatarColor: "bg-pink-400",
  },
  {
    id: 3,
    name: "Jivit",
    skill: ["Network", "IT"],
    status: "available",
    avatarColor: "bg-green-400",
  },
  {
    id: 4,
    name: "Amit",
    skill: ["General"],
    status: "on-call",
    avatarColor: "bg-yellow-400",
  },
];

const timeseries = [
  { name: "00:00", value: 10 },
  { name: "04:00", value: 20 },
  { name: "08:00", value: 28 },
  { name: "12:00", value: 16 },
  { name: "16:00", value: 24 },
  { name: "20:00", value: 12 },
];

const categoryData = [
  { name: "Electrical", value: 12 },
  { name: "Plumbing", value: 6 },
  { name: "HVAC", value: 8 },
  { name: "Network", value: 10 },
];
const PIE_COLORS = ["#06b6d4", "#7c3aed", "#f472b6", "#f59e0b"];

export default function UserDashboardFull() {
  const [user] = useState(mockUser);
  const [assignments, setAssignments] = useState(mockAssignments);
  const [engineers] = useState(mockEngineers);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [slaHealth, setSlaHealth] = useState(92); // out of 100
  const [filterLocation, setFilterLocation] = useState(null);

  useEffect(() => {
    // Simulate incoming notifications
    const n1 = {
      id: 1,
      type: "issue",
      title: "New Issue: Power spike - Dock 1",
      time: "2m ago",
    };
    const n2 = {
      id: 2,
      type: "sla",
      title: "SLA Warning: 1 mission near breach",
      time: "10m ago",
    };
    const timer = setTimeout(
      () => setNotifications((s) => [n1, n2, ...s]),
      1500
    );

    const tick = setInterval(() => {
      // small SLA fluctuation animation
      setSlaHealth((v) =>
        Math.max(55, Math.min(99, v + (Math.random() > 0.5 ? 1 : -1)))
      );
    }, 2500);

    return () => {
      clearInterval(timer);
      clearInterval(tick);
    };
  }, []);

  const assignEngineer = (eng, mission) => {
    // Fake assign: in real app you'd call an API
    setAssignments((list) =>
      list.map((a) =>
        a.id === mission.id ? { ...a, status: "in-progress" } : a
      )
    );
    setNotifications((n) => [
      {
        id: Date.now(),
        type: "assign",
        title: `Assigned ${eng.name} to ${mission.title}`,
        time: "now",
      },
      ...n,
    ]);
  };

  const createQuickIssue = () => {
    const newIssue = {
      id: Date.now(),
      title: "Quick: Minor sensor glitch",
      status: "open",
      dueDate: new Date().toISOString().slice(0, 10),
      priority: "low",
      location: "Sector X",
    };
    setAssignments((s) => [newIssue, ...s]);
    setNotifications((n) => [
      {
        id: Date.now() + 1,
        type: "issue",
        title: `Quick issue created: ${newIssue.title}`,
        time: "now",
      },
      ...n,
    ]);
  };

  const filteredAssignments = filterLocation
    ? assignments.filter((a) => a.location === filterLocation)
    : assignments;

  return (
    <div className="min-h-screen bg-[#050505] text-white relative font-orbitron overflow-hidden">
      {/* stars bg */}
      <div className="fixed inset-0 -z-10 bg-black/80">
        <div
          style={{
            backgroundImage:
              "url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png')",
          }}
          className="absolute inset-0 opacity-40 bg-repeat animate-[moveStars_100s_linear_infinite]"
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/30 to-transparent"></div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 p-6 border-r border-purple-800/30 min-h-screen backdrop-blur-md bg-black/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-black font-bold">
              Z
            </div>
            <div>
              <div className="text-sm text-cyan-300 uppercase tracking-widest">
                Zordon Ops Hub
              </div>
              <div className="text-xs text-gray-300">
                {user.name} • {user.role}
              </div>
            </div>
          </div>

          <nav className="space-y-2 text-sm">
            <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
              <ChartBarIcon className="w-5 h-5 text-cyan-300" /> Dashboard
            </a>
            <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
              {" "}
              <ExclamationIcon className="w-5 h-5 text-amber-400" /> Issues
            </a>
            <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
              {" "}
              <UsersIcon className="w-5 h-5 text-pink-400" /> Engineers
            </a>
            <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
              {" "}
              <ClockIcon className="w-5 h-5 text-green-300" /> SLAs
            </a>
            <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
              {" "}
              <SparklesIcon className="w-5 h-5 text-purple-400" /> Reports
            </a>
          </nav>

          <div className="mt-8">
            <h4 className="text-xs text-gray-400 uppercase tracking-widest">
              Quick Filters
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {[null, ...new Set(assignments.map((a) => a.location))].map(
                (loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFilterLocation(loc)}
                    className={`px-3 py-1 rounded-full text-xs ${
                      filterLocation === loc
                        ? "bg-cyan-400 text-black"
                        : "bg-white/5 text-gray-200"
                    }`}
                  >
                    {loc || "All"}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mt-8 text-xs text-gray-400">
            Build: <span className="text-cyan-300 font-semibold">v0.9-pre</span>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <header className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold">
                Welcome,{" "}
                <span className="text-cyan-300">{user.name.split(" ")[0]}</span>
              </h1>
              <p className="text-sm text-gray-300 mt-1">
                Facility Operations • Real-time Command Center
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications((s) => !s)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/7 transition"
                >
                  <BellIcon className="w-5 h-5 text-cyan-300" />
                </button>
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 text-[10px] px-1 rounded-full bg-rose-500">
                    {notifications.length}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <div className="text-xs text-gray-400">Active Role</div>
                  <div className="text-sm">Administrator</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-black font-bold">
                  {user.name[0]}
                </div>
              </div>
            </div>
          </header>

          {/* Top stats + SLA + Charts */}
          <section className="grid grid-cols-12 gap-6">
            <div className="col-span-12 xl:col-span-7">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Card
                  title="Total Issues"
                  value={assignments.length}
                  icon={<ExclamationIcon className="w-6 h-6 text-amber-400" />}
                />
                <Card
                  title="Open"
                  value={assignments.filter((a) => a.status === "open").length}
                  icon={<ExclamationIcon className="w-6 h-6 text-red-400" />}
                />
                <Card
                  title="In Progress"
                  value={
                    assignments.filter((a) => a.status === "in-progress").length
                  }
                  icon={<UsersIcon className="w-6 h-6 text-cyan-300" />}
                />
              </div>

              <div className="neon-card p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-gray-300">
                      Live Issue Throughput
                    </h3>
                    <p className="text-xs text-gray-400">
                      Requests per hour • last 24 hrs
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-cyan-300">
                      {Math.round(Math.random() * 100)}
                    </div>
                    <div className="text-xs text-gray-400">avg</div>
                  </div>
                </div>

                <div style={{ height: 140 }} className="mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeseries}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis hide domain={[0, 40]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="neon-card p-4">
                  <h4 className="text-sm text-gray-300">Issue Categories</h4>
                  <div style={{ height: 170 }} className="mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={2}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="neon-card p-4">
                  <h4 className="text-sm text-gray-300">AI Insights</h4>
                  <div className="mt-3 text-sm text-gray-300">
                    <p>
                      • 3 missions likely to breach SLA in the next 4 hours.
                    </p>
                    <p>• Recommend assign 2 engineers to HVAC this shift.</p>
                    <p className="mt-3 text-xs text-gray-400">
                      (Insight module is demo/static - plug your analytics API
                      for live predictions)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* right column */}
            <div className="col-span-12 xl:col-span-5">
              <div className="neon-card p-4 mb-4 flex flex-col items-center">
                <h4 className="text-sm text-gray-300 mb-2">SLA Health</h4>
                <Gauge value={slaHealth} size={160} />
                <div className="mt-3 text-sm text-gray-400">
                  System SLA Compliance •{" "}
                  <span className="text-cyan-300 font-semibold">
                    {slaHealth}%
                  </span>
                </div>
              </div>

              <div className="neon-card p-4">
                <h4 className="text-sm text-gray-300 mb-3">Engineer Pool</h4>
                <div className="flex flex-col gap-3">
                  {engineers.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-md flex items-center justify-center text-black font-bold ${e.avatarColor}`}
                        >
                          {e.name[0]}
                        </div>
                        <div>
                          <div className="text-sm">{e.name}</div>
                          <div className="text-xs text-gray-400">
                            {e.skill.join(", ")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-2 py-1 rounded-full text-xs ${
                            e.status === "available"
                              ? "bg-green-500 text-black"
                              : e.status === "busy"
                              ? "bg-amber-400 text-black"
                              : "bg-white/5 text-gray-300"
                          }`}
                        >
                          {e.status}
                        </div>
                        <button
                          onClick={() => assignEngineer(e, assignments[0])}
                          className="px-3 py-1 rounded-md bg-cyan-400 text-black text-xs font-bold"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Timeline + Assignments Table + Heatmap */}
          <section className="mt-6 grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4 neon-card p-4">
              <h4 className="text-sm text-gray-300 mb-3">Activity Timeline</h4>
              <Timeline items={notifications.slice(0, 8)} />
            </div>

            <div className="col-span-12 lg:col-span-5 neon-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm text-gray-300">Open Missions</h4>
                <div className="text-xs text-gray-400">
                  {filteredAssignments.length} missions
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400">
                      <th className="pb-2">Title</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Due</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((a) => (
                      <tr key={a.id} className="border-t border-white/5">
                        <td className="py-3">{a.title}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              a.status === "completed"
                                ? "bg-green-600 text-black"
                                : a.status === "in-progress"
                                ? "bg-amber-400 text-black"
                                : "bg-white/5 text-gray-200"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3">{a.dueDate}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setSelectedMission(a)}
                            className="px-3 py-1 rounded-md bg-gradient-to-r from-cyan-500 to-purple-500 text-black text-sm font-bold"
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-3 neon-card p-4">
              <h4 className="text-sm text-gray-300 mb-3">Issue Heatmap</h4>
              <Heatmap
                assignments={assignments}
                onSelect={(loc) => setFilterLocation(loc)}
              />
            </div>
          </section>

          {/* Floating Actions */}
          <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
            <button
              onClick={createQuickIssue}
              className="p-4 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-black shadow-lg transform hover:scale-105 transition"
            >
              {" "}
              <FiPlus />{" "}
            </button>
            <button
              onClick={() => setShowNotifications(true)}
              className="p-4 rounded-full bg-white/5"
            >
              {" "}
              <FiMessageCircle />{" "}
            </button>
          </div>

          {/* Notifications drawer */}
          {showNotifications && (
            <div className="fixed right-6 top-20 w-96 bg-black/80 backdrop-blur-md border border-white/6 p-4 rounded-lg shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm text-gray-200">Notifications</h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-gray-400"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 && (
                  <div className="text-gray-400 text-sm">No notifications</div>
                )}
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 bg-white/3 rounded-md">
                    <div className="text-sm font-semibold">{n.title}</div>
                    <div className="text-xs text-gray-400">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mission Modal */}
          {selectedMission && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
              <div className="w-[900px] max-w-full neon-card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedMission.title}
                    </h3>
                    <div className="text-sm text-gray-400">
                      {selectedMission.location} • Due {selectedMission.dueDate}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMission(null)}
                    className="text-gray-400"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm text-gray-300 mb-3">
                      Description: Placeholder mission details. Add notes,
                      attachments, and history here.
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-xs text-gray-400 uppercase">
                        Comments
                      </h4>
                      <div className="p-3 bg-white/3 rounded-md text-sm">
                        No comments yet.
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs text-gray-400 uppercase">Assign</h4>
                    <div className="mt-2 space-y-2">
                      {engineers.map((eng) => (
                        <div
                          key={eng.id}
                          className="flex items-center justify-between"
                        >
                          <div className="text-sm">{eng.name}</div>
                          <button
                            onClick={() => assignEngineer(eng, selectedMission)}
                            className="px-3 py-1 rounded-md bg-cyan-400 text-black text-xs font-bold"
                          >
                            Assign
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* small custom styles used where Tailwind needs support */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        .neon-card { background: rgba(0,0,0,0.6); border-radius: 14px; border: 1px solid rgba(124,58,237,0.12); box-shadow: 0 20px 60px rgba(0,0,0,0.4); padding: 0.75rem; }
        @keyframes moveStars { from { background-position: 0 0 } to { background-position: -10000px 5000px } }
      `}</style>
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="neon-card p-4 flex items-center gap-3">
      <div className="p-3 rounded-lg bg-white/5">{icon}</div>
      <div>
        <div className="text-xs text-gray-400">{title}</div>
        <div className="text-2xl font-extrabold">{value}</div>
      </div>
    </div>
  );
}

function Gauge({ value = 75, size = 140 }) {
  const radius = size / 2 - 10;
  const circumference = radius * Math.PI;
  const pct = Math.max(0, Math.min(100, value));
  const dash = circumference * (pct / 100);
  const remainder = circumference - dash;

  const color = pct > 80 ? "#06b6d4" : pct > 60 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size / 1} viewBox={`0 0 ${size} ${size / 1}`}>
      <defs>
        <linearGradient id="g1" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle
          r={radius}
          cx="0"
          cy="0"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          transform="rotate(-90)"
        />
        <circle
          r={radius}
          cx="0"
          cy="0"
          stroke="url(#g1)"
          strokeWidth="12"
          fill="none"
          strokeDasharray={`${dash} ${remainder}`}
          strokeLinecap="round"
          transform="rotate(-90)"
        />
        <text
          x="0"
          y="6"
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill="white"
        >
          {pct}%
        </text>
      </g>
    </svg>
  );
}

function Timeline({ items = [] }) {
  if (!items.length)
    return <div className="text-sm text-gray-400">No activity yet.</div>;
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.id} className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
          <div>
            <div className="text-sm font-semibold">{it.title}</div>
            <div className="text-xs text-gray-400">{it.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Heatmap({ assignments = [], onSelect = () => {} }) {
  // Compute counts per location
  const locCounts = {};
  assignments.forEach((a) => {
    locCounts[a.location] = (locCounts[a.location] || 0) + 1;
  });
  const locations = Object.keys(locCounts);
  const max = Math.max(1, ...Object.values(locCounts));

  const grid = Array.from({ length: 9 }).map((_, i) => ({
    label: locations[i] || "—",
    count: locCounts[locations[i]] || 0,
  }));

  return (
    <div className="grid grid-cols-3 gap-2">
      {grid.map((g, i) => {
        const intensity = Math.round((g.count / max) * 100);
        const bg =
          g.count === 0
            ? "bg-white/3"
            : `bg-[rgba(124,58,237,${0.15 + intensity / 200})]`;
        return (
          <button
            key={i}
            onClick={() => onSelect(g.label === "—" ? null : g.label)}
            className={`${bg} p-3 rounded-md text-xs text-gray-200`}
          >
            <div className="font-semibold">{g.label}</div>
            <div className="text-[11px] text-gray-400">{g.count} issues</div>
          </button>
        );
      })}
    </div>
  );
}
