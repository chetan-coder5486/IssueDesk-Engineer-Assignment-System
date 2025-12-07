// App.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./EngineerDashboard.css";
/* ---------------------------
   Color palette (Power Rangers hybrid)
   --------------------------- */
const NEON = {
  cyan: "#00E6FF",
  purple: "#B54CFF",
  magenta: "#FF5CCB",
  dark: "#0b1220",
  panel: "#0f1724",
  accent: "linear-gradient(90deg,#00C6FF,#B54CFF)",
};

export default function EngineerDashboardMain() {
  return (
    <div className="pr-app">
      <BackgroundStars />
      <div className="pr-frame">
        <Sidebar />
        <main className="pr-main">
          <Topbar />
          <div className="pr-content">
            <Home />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------------------
   Background - starfield + vignette
   --------------------------- */
function BackgroundStars() {
  return <div className="pr-stars" aria-hidden />;
}

/* ---------------------------
   Sidebar
   --------------------------- */
function Sidebar() {
  return (
    <aside className="pr-sidebar">
      <div className="pr-brand">
        <div className="pr-logo">⚡</div>
        <div>
          <div className="pr-title">RECRUIT</div>
          <div className="pr-sub">NEW RANGER</div>
        </div>
      </div>

      <nav className="pr-nav">
        <NavLink to="/engineer-dashboard" label="Dashboard" active />
        <NavLink to="/engineer-issues" label="Issues" />
        <NavLink to="/engineer-tools" label="Tools" />
      </nav>

      <div className="pr-cta">
        <button className="pr-btn-glow">Initiate</button>
      </div>
    </aside>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link className={`pr-navlink ${active ? "active" : ""}`} to={to}>
      <span className="pr-navdot" /> {label}
    </Link>
  );
}

/* ---------------------------
   Topbar
   --------------------------- */
function Topbar() {
  return (
    <div className="pr-topbar">
      <div className="pr-top-left">Command Center</div>
      <div className="pr-top-right">
        Zordon Admin • <span className="pr-pill">Engineer</span>
      </div>
    </div>
  );
}

/* ---------------------------
   Home (engineer landing)
   --------------------------- */
function Home() {
  return (
    <div className="pr-grid">
      <div className="pr-welcome card">
        <h1>ENGINEER HUB</h1>
        <p className="muted">Power systems, assignments & diagnostics</p>

        <div className="pr-widgets">
          <Metric title="Assigned Issues" value="12" color="#FF6B6B" />
          <Metric title="In Progress" value="5" color="#00E6FF" />
          <Metric title="Completed" value="27" color="#7ED957" />
        </div>
      </div>

      <div className="card pr-links">
        <h3>Quick Access</h3>
        <div className="pr-quickgrid">
          <Link className="pr-quick" to="/engineer-dashboard">
            Dashboard →
          </Link>
          <Link className="pr-quick" to="/engineer-issues">
            Issues →
          </Link>
          <Link className="pr-quick" to="/engineer-tools">
            Tools →
          </Link>
        </div>
      </div>

      <DashboardView />
    </div>
  );
}

function Metric({ title, value, color }) {
  return (
    <div className="metric" style={{ borderColor: color }}>
      <div className="metric-title">{title}</div>
      <div className="metric-value" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

/* ---------------------------
   Engineer Dashboard (the main screen)
   --------------------------- */
function DashboardView() {
  const donutData = [
    { name: "Pending", value: 11 },
    { name: "In Progress", value: 5 },
    { name: "Completed", value: 2 },
  ];
  const donutColors = ["#B54CFF", "#00C6FF", "#7ED957"];

  const priorityData = [
    { level: "Low", count: 5 },
    { level: "Medium", count: 7 },
    { level: "High", count: 8 },
  ];

  return (
    <div className="pr-grid-2col">
      <div className="card pr-panel">
        <h2 className="panel-title">Welcome, Zordon</h2>

        <div className="panel-row">
          <div className="panel-left">
            <div className="kpi-row">
              <KPI label="Total Tasks" value="18" accent="#B54CFF" />
              <KPI label="Pending" value="11" accent="#8A2BE2" />
              <KPI label="In Progress" value="5" accent="#00C6FF" />
              <KPI label="Completed" value="2" accent="#7ED957" />
            </div>

            <div className="card small">
              <h4>Recent Tasks</h4>
              <RecentTasks />
            </div>
          </div>

          <div className="panel-right">
            <div className="card chart-card">
              <h4>Task Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={donutColors[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card chart-card">
              <h4>Task Priority Levels</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={priorityData}>
                  <XAxis dataKey="level" stroke="#8B95A6" />
                  <YAxis stroke="#8B95A6" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#B54CFF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, accent }) {
  return (
    <div className="kpi" style={{ borderColor: accent }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

/* ---------------------------
   Recent Tasks table
   --------------------------- */
function RecentTasks() {
  const rows = [
    {
      name: "Develop Product Review System",
      status: "Pending",
      priority: "Low",
      date: "17th Mar 2025",
    },
    {
      name: "Build Feedback Form Module",
      status: "Pending",
      priority: "High",
      date: "17th Mar 2025",
    },
    {
      name: "Implement Notification System",
      status: "Pending",
      priority: "Low",
      date: "17th Mar 2025",
    },
    {
      name: "Migrate Database to MongoDB Atlas",
      status: "Completed",
      priority: "Medium",
      date: "17th Mar 2025",
    },
  ];

  const badge = (t) => {
    const map = {
      Pending: "#B388FF",
      Completed: "#7ED957",
      Assigned: "#00E6FF",
    };
    return (
      <span className="badge" style={{ background: map[t] || "#8A90FF" }}>
        {t}
      </span>
    );
  };

  const pbadge = (p) => {
    const map = { Low: "#7ED957", Medium: "#FFB84D", High: "#FF6B6B" };
    return (
      <span className="pbadge" style={{ background: map[p] }}>
        {p}
      </span>
    );
  };

  return (
    <table className="recent-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Created On</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{r.name}</td>
            <td>{badge(r.status)}</td>
            <td>{pbadge(r.priority)}</td>
            <td>{r.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ---------------------------
   Small placeholder pages
   --------------------------- */
function Issues() {
  const navigate = useNavigate();
  return (
    <div className="card">
      <h2>Issues</h2>
      <p>Issue list & filters — (placeholder)</p>
      <button
        className="pr-link"
        onClick={() => navigate("/engineer/dashboard")}
      >
        Open Dashboard
      </button>
    </div>
  );
}
function Tools() {
  return (
    <div className="card">
      <h2>Tools & Diagnostics</h2>
      <p>Sensor scanners, logs & maintenance tools (placeholder)</p>
    </div>
  );
}
