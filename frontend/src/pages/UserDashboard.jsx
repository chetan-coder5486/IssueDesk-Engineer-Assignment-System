import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../store/authSlice.js";
import {
  fetchMyTickets,
  createTicket,
  resetCreateStatus,
} from "../store/ticketSlice.js";
import Navbar from "./Navbar.jsx";
import SLATimer from "../components/SLATimer.jsx";
import Comments from "../components/Comments.jsx";

// Department color mapping
const departmentColors = {
  RED: "#ef4444",
  BLUE: "#3b82f6",
  GREEN: "#22c55e",
  YELLOW: "#eab308",
  PINK: "#ec4899",
  BLACK: "#6b7280",
};

export default function UserDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { myTickets, loading, error, createStatus, createError } = useSelector(
    (state) => state.tickets
  );

  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "General",
  });

  // Get user's department color
  const themeColor = departmentColors[user?.department] || "#a855f7";
  const themeGlow = `${themeColor}80`;

  const dynamicStyles = {
    "--theme-color": themeColor,
    "--theme-glow": themeGlow,
    "--theme-gradient": `linear-gradient(to right, ${themeColor}, #a855f7)`,
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Redirect engineers to their dashboard
    if (user.role === "ENGINEER") {
      navigate("/engineer-dashboard");
      return;
    }
    dispatch(fetchMyTickets());
  }, [user, navigate, dispatch]);

  // Handle successful ticket creation
  useEffect(() => {
    if (createStatus === "succeeded") {
      setShowRaiseForm(false);
      setNewIssue({
        title: "",
        description: "",
        priority: "MEDIUM",
        category: "General",
      });
      dispatch(resetCreateStatus());
    }
  }, [createStatus, dispatch]);

  const handleRaiseIssue = (e) => {
    e.preventDefault();
    dispatch(createTicket(newIssue));
  };

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: "bg-red-500/20 text-red-400 border-red-500/30",
      ASSIGNED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      IN_PROGRESS: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      PENDING_PARTS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      RESOLVED: "bg-green-500/20 text-green-400 border-green-500/30",
      CLOSED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return styles[status] || styles.OPEN;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      CRITICAL: "text-red-500",
      HIGH: "text-red-400",
      MEDIUM: "text-amber-400",
      LOW: "text-green-400",
    };
    return styles[priority] || styles.MEDIUM;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate stats
  const stats = {
    open: myTickets.filter((t) => t.status === "OPEN").length,
    inProgress: myTickets.filter(
      (t) => t.status === "IN_PROGRESS" || t.status === "ASSIGNED"
    ).length,
    resolved: myTickets.filter(
      (t) => t.status === "RESOLVED" || t.status === "CLOSED"
    ).length,
  };

  if (!user) return null;

  return (
    <div
      className="relative min-h-screen font-orbitron overflow-hidden bg-[#050505] text-white"
      style={dynamicStyles}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

        .font-orbitron { font-family: 'Orbitron', sans-serif; }

        .dynamic-text { color: var(--theme-color); transition: color 0.3s ease; }
        .dynamic-border { border-color: var(--theme-color); transition: border-color 0.3s ease; }
        .dynamic-bg { background-color: var(--theme-color); }

        .dynamic-gradient-text {
          background: var(--theme-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .dynamic-shadow {
          box-shadow: 0 0 60px var(--theme-glow);
        }

        .stars {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: #000 url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png') repeat;
          z-index: 0; animation: moveStars 100s linear infinite;
        }
        @keyframes moveStars { from { background-position: 0 0; } to { background-position: -10000px 5000px; } }

        .floating-card { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }

        .glow-input:focus {
          box-shadow: 0 0 20px var(--theme-glow), inset 0 0 10px var(--theme-glow);
          border-color: var(--theme-color);
        }

        .neon-button {
          position: relative; z-index: 1; overflow: hidden; transition: 0.3s;
          background: linear-gradient(to right, var(--theme-color), #4c1d95, var(--theme-color));
          background-size: 200% auto;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .neon-button:hover {
          box-shadow: 0 0 30px var(--theme-glow);
          transform: scale(1.02);
          background-position: right center;
        }

        .card {
          background: rgba(0,0,0,0.7);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
        }

        .card-hover:hover {
          border-color: var(--theme-color);
          box-shadow: 0 0 20px var(--theme-glow);
        }

        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: var(--theme-color); border-radius: 3px; }
      `}</style>

      {/* Stars Background */}
      <div className="stars"></div>

      {/* Navbar */}
      <Navbar />

      {/* Main Container */}
      <div className="relative z-10">
        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <section className="mb-8">
            <div className="card p-8 dynamic-shadow floating-card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black mb-2">
                    Welcome back,{" "}
                    <span className="dynamic-gradient-text">
                      {user.name?.split(" ")[0] || "Ranger"}
                    </span>
                  </h2>
                  <p className="text-gray-400">
                    Department:{" "}
                    <span className="dynamic-text font-bold">
                      {user.department} RANGER
                    </span>{" "}
                    • Ready to protect the grid
                  </p>
                </div>
                <button
                  onClick={() => setShowRaiseForm(true)}
                  className="neon-button text-white font-bold py-3 px-6 rounded-xl uppercase tracking-wider"
                >
                  + Raise New Issue
                </button>
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card card-hover p-6 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Open Issues
                  </p>
                  <p className="text-2xl font-black text-red-400">
                    {stats.open}
                  </p>
                </div>
              </div>
            </div>

            <div className="card card-hover p-6 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    In Progress
                  </p>
                  <p className="text-2xl font-black text-amber-400">
                    {stats.inProgress}
                  </p>
                </div>
              </div>
            </div>

            <div className="card card-hover p-6 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Resolved
                  </p>
                  <p className="text-2xl font-black text-green-400">
                    {stats.resolved}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12 text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mx-auto mb-4"></div>
              Loading your issues...
            </div>
          )}

          {/* Issues Table */}
          {!loading && (
            <section className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold uppercase tracking-wider">
                  My Issues
                </h3>
                <p className="text-xs text-gray-400">
                  {myTickets.length} total issues
                </p>
              </div>

              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">
                        Priority
                      </th>
                      <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">
                        SLA
                      </th>
                      <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">
                        Created
                      </th>
                      <th className="text-right py-3 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTickets.map((issue) => (
                      <tr
                        key={issue._id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="font-semibold">{issue.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {issue.category || "General"}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                              issue.status
                            )}`}
                          >
                            {issue.status?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`text-xs font-bold uppercase ${getPriorityBadge(
                              issue.priority
                            )}`}
                          >
                            {issue.priority}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <SLATimer
                            dueDate={issue.dueDate}
                            status={issue.status}
                            breached={issue.breached}
                            size="sm"
                          />
                        </td>
                        <td className="py-4 px-4 text-gray-400">
                          {formatDate(issue.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedIssue(issue)}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors dynamic-border border hover:dynamic-text"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {myTickets.length === 0 && !loading && (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-lg mb-2">No issues found</p>
                    <p className="text-sm">
                      Click "Raise New Issue" to create your first ticket
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Raise Issue Modal */}
      {showRaiseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="card p-8 w-full max-w-lg dynamic-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black uppercase tracking-wider">
                Raise New Issue
              </h3>
              <button
                onClick={() => setShowRaiseForm(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleRaiseIssue} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Issue Title *
                </label>
                <input
                  type="text"
                  value={newIssue.title}
                  onChange={(e) =>
                    setNewIssue({ ...newIssue, title: e.target.value })
                  }
                  required
                  placeholder="Brief description of the issue"
                  className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none glow-input transition-all placeholder-gray-600 font-bold tracking-wider text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={newIssue.category}
                  onChange={(e) =>
                    setNewIssue({ ...newIssue, category: e.target.value })
                  }
                  className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none glow-input transition-all font-bold tracking-wider text-sm appearance-none cursor-pointer"
                >
                  <option value="General">General</option>
                  <option value="IT">IT / Network</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Security">Security</option>
                  <option value="Facilities">Facilities</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={newIssue.description}
                  onChange={(e) =>
                    setNewIssue({ ...newIssue, description: e.target.value })
                  }
                  rows={4}
                  placeholder="Detailed explanation of the problem"
                  className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none glow-input transition-all placeholder-gray-600 font-bold tracking-wider text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Priority Level
                </label>
                <select
                  value={newIssue.priority}
                  onChange={(e) =>
                    setNewIssue({ ...newIssue, priority: e.target.value })
                  }
                  className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none glow-input transition-all font-bold tracking-wider text-sm appearance-none cursor-pointer"
                >
                  <option value="LOW">LOW - Can wait</option>
                  <option value="MEDIUM">MEDIUM - Needs attention</option>
                  <option value="HIGH">HIGH - Urgent</option>
                  <option value="CRITICAL">CRITICAL - Emergency</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={createStatus === "loading"}
                  className="w-full neon-button text-white font-black py-4 rounded-xl uppercase tracking-wider text-lg disabled:opacity-50"
                >
                  {createStatus === "loading"
                    ? "Submitting..."
                    : "Submit Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="card p-8 w-full max-w-2xl dynamic-shadow max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-black mb-2">
                  {selectedIssue.title}
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                      selectedIssue.status
                    )}`}
                  >
                    {selectedIssue.status?.replace("_", " ")}
                  </span>
                  <span
                    className={`text-xs font-bold uppercase ${getPriorityBadge(
                      selectedIssue.priority
                    )}`}
                  >
                    {selectedIssue.priority} Priority
                  </span>
                  <SLATimer
                    dueDate={selectedIssue.dueDate}
                    status={selectedIssue.status}
                    breached={selectedIssue.breached}
                    size="md"
                  />
                </div>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Description
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {selectedIssue.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Category
                  </h4>
                  <p className="font-bold">
                    {selectedIssue.category || "General"}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Created On
                  </h4>
                  <p className="font-bold">
                    {formatDate(selectedIssue.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Assigned To
                  </h4>
                  <p className="font-bold">
                    {selectedIssue.assignee?.name || "Not Assigned"}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Ticket ID
                  </h4>
                  <p className="font-bold dynamic-text">
                    #{selectedIssue._id?.slice(-8) || "N/A"}
                  </p>
                </div>
              </div>

              {selectedIssue.dueDate && (
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Due Date
                  </h4>
                  <p className="font-bold">
                    {formatDate(selectedIssue.dueDate)}
                  </p>
                </div>
              )}

              {/* Comments Section */}
              <div>
                <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                  Discussion
                </h4>
                <Comments ticketId={selectedIssue._id} />
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-bold uppercase tracking-wider transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
