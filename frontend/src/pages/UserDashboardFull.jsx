// ./pages/UserDashboardFull.jsx
import React, { useEffect, useState } from "react";
import {
  BellIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationIcon,
  UsersIcon,
  SparklesIcon,
} from "@heroicons/react/outline";
import { FiPlus, FiMessageSquare } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/*
  Futuristic Sci-Fi Command Center Dashboard
  - Drop into a React + Tailwind app.
  - Replace mock data with your API endpoints as needed.
  - Dependencies: recharts, react-icons, @heroicons/react@1
*/

const mockUser = { name: "Amit Kumar", email: "amitk060307@gmail.com", role: "Admin" };

const mockAssignments = [
  { id: 1, title: "Replace AC Filter - Block A", status: "in-progress", dueDate: "2025-12-08", priority: "medium", location: "Block A", description: "AC filter heavily soiled." },
  { id: 2, title: "Restore Backup Power - Dock 3", status: "open", dueDate: "2025-12-06", priority: "high", location: "Dock 3", description: "UPS tripped during surge." },
  { id: 3, title: "Network outage - Floor 5", status: "completed", dueDate: "2025-12-02", priority: "high", location: "Floor 5", description: "Fiber splice repaired." },
  { id: 4, title: "Leakage in Roof Panel - Sector 7", status: "open", dueDate: "2025-12-10", priority: "low", location: "Sector 7", description: "Minor seepage near junction." },
];

const mockEngineers = [
  { id: 1, name: "Chetan", skill: ["Electrical"], status: "available", color: "#06b6d4" },
  { id: 2, name: "Pawan", skill: ["Mechanical"], status: "busy", color: "#f472b6" },
  { id: 3, name: "Jivit", skill: ["Network", "IT"], status: "available", color: "#7c3aed" },
  { id: 4, name: "Amit", skill: ["General"], status: "on-call", color: "#f59e0b" },
];

const timeseries = [
  { name: "00:00", value: 8 },
  { name: "04:00", value: 18 },
  { name: "08:00", value: 26 },
  { name: "12:00", value: 14 },
  { name: "16:00", value: 22 },
  { name: "20:00", value: 11 },
];

const categoryData = [
  { name: "Electrical", value: 12 },
  { name: "Plumbing", value: 6 },
  { name: "HVAC", value: 8 },
  { name: "Network", value: 10 },
];
const PIE_COLORS = ["#06b6d4", "#7c3aed", "#f472b6", "#f59e0b"];

export default function UserDashboardFull() {
  // UI state
  const [user] = useState(mockUser);
  const [section, setSection] = useState("dashboard"); // dashboard | issues | engineers | slas | reports
  const [assignments, setAssignments] = useState(mockAssignments);
  const [engineers, setEngineers] = useState(mockEngineers);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [slaHealth, setSlaHealth] = useState(92); // 0-100
  const [filterLocation, setFilterLocation] = useState(null);

  // Simulate incoming notifications & SLA wiggle
  useEffect(() => {
    const n1 = { id: Date.now() + 1, type: "issue", title: "New Issue: Power spike - Dock 1", time: "2m ago" };
    const n2 = { id: Date.now() + 2, type: "sla", title: "SLA Warning: 1 mission near breach", time: "10m ago" };
    const t = setTimeout(() => setNotifications((s) => [n1, n2, ...s]), 1200);

    const tick = setInterval(() => {
      setSlaHealth((v) => Math.max(50, Math.min(99, v + (Math.random() > 0.5 ? 1 : -1))));
    }, 2600);

    return () => {
      clearTimeout(t);
      clearInterval(tick);
    };
  }, []);

  // Helpers
  const assignEngineer = (eng, mission) => {
    if (!mission) return;
    setAssignments((list) => list.map((a) => (a.id === mission.id ? { ...a, status: "in-progress" } : a)));
    const note = { id: Date.now(), type: "assign", title: `Assigned ${eng.name} to ${mission.title}`, time: "now" };
    setNotifications((n) => [note, ...n]);
  };

  const createQuickIssue = () => {
    const newIssue = {
      id: Date.now(),
      title: "Quick: Minor sensor glitch",
      status: "open",
      dueDate: new Date().toISOString().slice(0, 10),
      priority: "low",
      location: "Sector X",
      description: "Auto-created quick issue",
    };
    setAssignments((s) => [newIssue, ...s]);
    setNotifications((n) => [{ id: Date.now() + 1, type: "issue", title: `Quick issue created: ${newIssue.title}`, time: "now" }, ...n]);
  };

  const filteredAssignments = filterLocation ? assignments.filter((a) => a.location === filterLocation) : assignments;

  // Heatmap helpers: compute counts by location
  const locationCounts = assignments.reduce((acc, a) => {
    if (!a.location) return acc;
    acc[a.location] = (acc[a.location] || 0) + 1;
    return acc;
  }, {});
  const locations = Object.keys(locationCounts);
  const heatMax = Math.max(1, ...Object.values(locationCounts));

  return (
    <div className="min-h-screen font-orbitron text-white bg-[#050505] relative overflow-hidden">
      {/* Stars background */}
      <div className="fixed inset-0 -z-10">
        <div style={{ backgroundImage: "url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png')" }} className="absolute inset-0 opacity-25 bg-repeat animate-[moveStars_100s_linear_infinite]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#040417]/70 to-transparent"></div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-72 p-6 border-r border-white/20 bg-black/50 backdrop-blur-lg sticky top-0 h-screen">
          <div className="flex items-center gap-3 mb-6">
            <div style={{ background: "linear-gradient(90deg,#06b6d4,#7c3aed)" }} className="w-12 h-12 rounded-xl flex items-center justify-center text-black font-black text-lg">Z</div>
            <div>
              <div className="text-sm text-cyan-300 uppercase tracking-wider">Zordon Ops Hub</div>
              <div className="text-xs text-gray-300">{user.name} • {user.role}</div>
            </div>
          </div>

          <nav className="space-y-2">
            <SidebarItem icon={<ChartBarIcon className="w-5 h-5 text-cyan-300" />} label="Dashboard" active={section === "dashboard"} onClick={() => setSection("dashboard")} />
            <SidebarItem icon={<ExclamationIcon className="w-5 h-5 text-amber-400" />} label="Issues" active={section === "issues"} onClick={() => setSection("issues")} />
            <SidebarItem icon={<UsersIcon className="w-5 h-5 text-pink-400" />} label="Engineers" active={section === "engineers"} onClick={() => setSection("engineers")} />
            <SidebarItem icon={<ClockIcon className="w-5 h-5 text-green-300" />} label="SLAs" active={section === "slas"} onClick={() => setSection("slas")} />
            <SidebarItem icon={<SparklesIcon className="w-5 h-5 text-purple-400" />} label="Reports" active={section === "reports"} onClick={() => setSection("reports")} />
          </nav>

          <div className="mt-6">
            <h4 className="text-xs text-gray-400 uppercase tracking-wider">Quick Filters</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setFilterLocation(null)} className={`px-3 py-1 rounded-full text-xs ${filterLocation === null ? "bg-cyan-400 text-black" : "bg-white/5 text-gray-200"}`}>All</button>
              {locations.map((loc) => (
                <button key={loc} onClick={() => setFilterLocation(loc)} className={`px-3 py-1 rounded-full text-xs ${filterLocation === loc ? "bg-cyan-400 text-black" : "bg-white/5 text-gray-200"}`}>{loc}</button>
              ))}
            </div>
          </div>

          <div className="mt-8 text-xs text-gray-400">Build: <span className="text-cyan-300 font-semibold">v0.9-pre</span></div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          {/* Header */}
          <header className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold">Welcome, <span className="text-cyan-300">{user.name.split(" ")[0]}</span></h1>
              <p className="text-sm text-gray-300 mt-1">Facility Operations • Real-time Command Center</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button onClick={() => setShowNotifications((s) => !s)} className="p-2 rounded-lg bg-white/5 hover:bg-white/7 transition">
                  <BellIcon className="w-5 h-5 text-cyan-300" />
                </button>
                {notifications.length > 0 && <div className="absolute -top-1 -right-1 text-[10px] px-1 rounded-full bg-rose-500">{notifications.length}</div>}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <div className="text-xs text-gray-400">Active Role</div>
                  <div className="text-sm">Administrator</div>
                </div>
                <div style={{ background: "linear-gradient(90deg,#7c3aed,#06b6d4)" }} className="w-10 h-10 rounded-lg flex items-center justify-center text-black font-bold">{user.name[0]}</div>
              </div>
            </div>
          </header>

          {/* Sections grid */}
          <section className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-4">
              {/* Conditional: Dashboard vs others */}
              {section === "dashboard" && (
                <>
                  <div className="p-4 rounded-xl border border-white/25 backdrop-blur-md bg-black/45">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400">Live Issue Throughput</div>
                        <div className="text-sm text-gray-300">Requests per hour • last 24 hrs</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-cyan-300">{Math.round(Math.random() * 100)}</div>
                        <div className="text-xs text-gray-400">avg</div>
                      </div>
                    </div>
                    <div style={{ height: 160 }} className="mt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeseries}>
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                          <YAxis hide domain={[0, 40]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-white/25 bg-black/45">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-300 font-bold">Issue Categories</div>
                          <div className="text-xs text-gray-400">Distribution</div>
                        </div>
                      </div>
                      <div style={{ height: 160 }} className="mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60} paddingAngle={2}>
                              {categoryData.map((entry, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-white/25 bg-black/45">
                      <div>
                        <div className="text-sm text-gray-300 font-bold">AI Insights</div>
                        <div className="text-xs text-gray-400">Actionable recommendations</div>
                      </div>
                      <div className="mt-3 text-sm text-gray-300">
                        <p>• 3 missions likely to breach SLA in next 4 hours.</p>
                        <p>• Recommend assigning 2 engineers to HVAC.</p>
                        <p className="mt-3 text-xs text-gray-400">(Demo insights — connect to analytics API for live)</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {section === "issues" && (
                <div className="p-4 rounded-xl border border-white/25 bg-black/45">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-cyan-300">Open Missions</h3>
                      <div className="text-xs text-gray-400">Manage and triage active issues</div>
                    </div>
                    <div>
                      <button onClick={createQuickIssue} className="px-3 py-2 rounded-md bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold">Quick Issue</button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full table-auto text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-400">
                          <th className="pb-2">Title</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Due</th>
                          <th className="pb-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssignments.map((a) => (
                          <tr key={a.id} className="border-t border-white/6">
                            <td className="py-3">{a.title}</td>
                            <td className="py-3">
                              <StatusBadge status={a.status} />
                            </td>
                            <td className="py-3">{a.dueDate || a.due || "—"}</td>
                            <td className="py-3 text-right">
                              <button onClick={() => setSelectedMission(a)} className="px-3 py-1 rounded-md bg-gradient-to-r from-cyan-400 to-purple-500 text-black text-sm font-bold">Open</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {section === "engineers" && (
                <div className="p-4 rounded-xl border border-white/25 bg-black/45">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-cyan-300">Engineer Pool</h3>
                    <div className="text-xs text-gray-400">{engineers.length} available</div>
                  </div>

                  <div className="grid gap-3">
                    {engineers.map((e) => (
                      <div key={e.id} className="p-3 rounded-md bg-white/3 bg-opacity-3 border border-white/6 flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{e.name}</div>
                          <div className="text-xs text-gray-400">{e.skill.join ? e.skill.join(", ") : e.skill} • {e.status}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div style={{ width: 36, height: 36, background: e.color }} className="rounded-md flex items-center justify-center font-bold text-black">{e.name[0]}</div>
                          <button onClick={() => assignEngineer(e, assignments[0])} className="px-3 py-1 rounded-md bg-cyan-400 text-black text-xs font-bold">Assign</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              {/* SLA card */}
              <div className="p-4 rounded-xl border border-white/25 bg-black/45 flex flex-col items-center">
                <div className="text-sm text-gray-300 font-semibold mb-2">SLA Health</div>
                <Gauge value={slaHealth} size={160} />
                <div className="mt-3 text-sm text-gray-400">System SLA Compliance • <span className="text-cyan-300 font-semibold">{slaHealth}%</span></div>
              </div>

              {/* Timeline */}
              <div className="p-4 rounded-xl border border-white/25 bg-black/45">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-300 font-semibold">Activity Timeline</div>
                  <div className="text-xs text-gray-400">{notifications.length} events</div>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {notifications.length === 0 ? <div className="text-sm text-gray-400">No activity yet.</div> :
                    notifications.slice(0, 8).map((n) => (
                      <div key={n.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
                        <div>
                          <div className="text-sm font-semibold">{n.title}</div>
                          <div className="text-xs text-gray-400">{n.time}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Heatmap */}
              <div className="p-4 rounded-xl border border-white/25 bg-black/45">
                <div className="text-sm text-gray-300 font-semibold mb-3">Issue Heatmap</div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, i) => {
                    const loc = locations[i] || "—";
                    const count = locationCounts[loc] || 0;
                    const intensity = Math.round((count / Math.max(1, heatMax)) * 100);
                    const bgColor = count === 0 ? "rgba(255,255,255,0.03)" : `rgba(124,58,237,${0.12 + intensity / 200})`;
                    return (
                      <button key={i} onClick={() => setFilterLocation(loc === "—" ? null : loc)} style={{ background: bgColor }} className="p-3 rounded-md text-xs text-gray-200 text-left">
                        <div className="font-semibold">{loc}</div>
                        <div className="text-[11px] text-gray-400">{count} issues</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Floating actions */}
          <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
            <button onClick={createQuickIssue} className="p-4 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-black shadow-lg transform hover:scale-105 transition"><FiPlus /></button>
            <button onClick={() => setShowNotifications(true)} className="p-4 rounded-full bg-white/5"><FiMessageSquare /></button>
          </div>

          {/* Notifications drawer */}
          {showNotifications && (
            <div className="fixed right-6 top-20 w-96 bg-black/80 backdrop-blur-md border border-white/6 p-4 rounded-lg shadow-2xl z-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm text-gray-200">Notifications</h4>
                <button onClick={() => setShowNotifications(false)} className="text-xs text-gray-400">Close</button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 && <div className="text-gray-400 text-sm">No notifications</div>}
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 bg-white/5 rounded-md">
                    <div className="text-sm font-semibold">{n.title}</div>
                    <div className="text-xs text-gray-400">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mission modal */}
          {selectedMission && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
              <div className="w-[900px] max-w-full rounded-xl border border-white/25 bg-black/50 backdrop-blur-lg p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{selectedMission.title}</h3>
                    <div className="text-sm text-gray-400">{selectedMission.location} • Due {selectedMission.dueDate || selectedMission.due}</div>
                  </div>
                  <button onClick={() => setSelectedMission(null)} className="text-gray-400">Close</button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm text-gray-300 mb-3">{selectedMission.description || "No description available."}</p>
                    <div className="space-y-2">
                      <h4 className="text-xs text-gray-400 uppercase">Comments</h4>
                      <div className="p-3 bg-white/5 rounded-md text-sm">No comments yet.</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs text-gray-400 uppercase">Assign</h4>
                    <div className="mt-2 space-y-2">
                      {engineers.map((eng) => (
                        <div key={eng.id} className="flex items-center justify-between">
                          <div className="text-sm">{eng.name}</div>
                          <button onClick={() => assignEngineer(eng, selectedMission)} className="px-3 py-1 rounded-md bg-cyan-400 text-black text-xs font-bold">Assign</button>
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        @keyframes moveStars { from { background-position: 0 0 } to { background-position: -10000px 5000px } }
      `}</style>
    </div>
  );
}

/* ---------------- small components ---------------- */

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${active ? 'bg-white/10 border border-white/25' : 'hover:bg-white/5'}`}>
      {icon}
      <div className="text-sm">{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "completed") return <span className="px-2 py-1 rounded-full text-xs bg-green-500 text-black">Completed</span>;
  if (status === "in-progress") return <span className="px-2 py-1 rounded-full text-xs bg-amber-400 text-black">In-Progress</span>;
  return <span className="px-2 py-1 rounded-full text-xs bg-white/5 text-gray-200">Open</span>;
}

function Gauge({ value = 80, size = 140 }) {
  const radius = size / 2 - 10;
  const circumference = radius * Math.PI;
  const pct = Math.max(0, Math.min(100, value));
  const dash = circumference * (pct / 100);
  const remainder = circumference - dash;

  return (
    <svg width={size} height={size / 1} viewBox={`0 0 ${size} ${size / 1}`}>
      <defs>
        <linearGradient id="g1" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} cx="0" cy="0" stroke="rgba(255,255,255,0.06)" strokeWidth="12" fill="none" strokeLinecap="round" transform="rotate(-90)" />
        <circle r={radius} cx="0" cy="0" stroke="url(#g1)" strokeWidth="12" fill="none" strokeDasharray={`${dash} ${remainder}`} strokeLinecap="round" transform="rotate(-90)" />
        <text x="0" y="6" textAnchor="middle" fontSize="20" fontWeight="700" fill="white">{pct}%</text>
      </g>
    </svg>
  );
}
