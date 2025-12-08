import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../store/authSlice.js";
import {
  fetchAssignedTickets,
  updateTicketStatus,
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

// Status workflow for engineers
const STATUS_OPTIONS = [
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PENDING_PARTS", label: "Pending Parts" },
  { value: "RESOLVED", label: "Resolved" },
];

export default function EngineerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { assignedTickets, loading, error } = useSelector(
    (state) => state.tickets
  );

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

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
    if (user.role !== "ENGINEER") {
      navigate("/user-dashboard");
      return;
    }
    dispatch(fetchAssignedTickets());
  }, [user, navigate, dispatch]);

  const handleStatusChange = async (ticketId, newStatus) => {
    setUpdatingId(ticketId);
    await dispatch(updateTicketStatus({ ticketId, status: newStatus }));
    setUpdatingId(null);
  };

  // Filter tickets
  const filteredTickets =
    statusFilter === "ALL"
      ? assignedTickets
      : assignedTickets.filter((t) => t.status === statusFilter);

  // Stats
  const stats = {
    total: assignedTickets.length,
    assigned: assignedTickets.filter((t) => t.status === "ASSIGNED").length,
    inProgress: assignedTickets.filter((t) => t.status === "IN_PROGRESS")
      .length,
    pendingParts: assignedTickets.filter((t) => t.status === "PENDING_PARTS")
      .length,
    resolved: assignedTickets.filter((t) => t.status === "RESOLVED").length,
  };

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: "bg-gray-500/20 text-gray-400 border-gray-500/30",
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

  if (!user || user.role !== "ENGINEER") return null;

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

        .glow-input:focus {
          box-shadow: 0 0 15px var(--theme-glow);
          border-color: var(--theme-color);
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
            <div className="card p-8 dynamic-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black mb-2">
                    Engineer Dashboard
                  </h2>
                  <p className="text-gray-400">
                    Welcome,{" "}
                    <span className="dynamic-gradient-text font-bold">
                      {user.name?.split(" ")[0] || "Engineer"}
                    </span>{" "}
                    • {user.department} Department
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 rounded-lg bg-white/5 text-sm font-bold uppercase tracking-wider border border-white/10">
                    {stats.total} Assigned Tasks
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Assigned"
              value={stats.assigned}
              color="#3b82f6"
              icon="📋"
            />
            <StatCard
              label="In Progress"
              value={stats.inProgress}
              color="#f59e0b"
              icon="⚙️"
            />
            <StatCard
              label="Pending Parts"
              value={stats.pendingParts}
              color="#a855f7"
              icon="📦"
            />
            <StatCard
              label="Resolved"
              value={stats.resolved}
              color="#22c55e"
              icon="✅"
            />
          </section>

          {/* Filter Tabs */}
          <section className="mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                "ALL",
                "ASSIGNED",
                "IN_PROGRESS",
                "PENDING_PARTS",
                "RESOLVED",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    statusFilter === status
                      ? "dynamic-bg text-black"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
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
              Loading tasks...
            </div>
          )}

          {/* Tickets Table */}
          {!loading && (
            <section className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold uppercase tracking-wider">
                  Assigned Tasks
                </h3>
                <p className="text-xs text-gray-400">
                  {filteredTickets.length} tasks
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
                        Priority
                      </th>
                      <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">
                        SLA Timer
                      </th>
                      <th className="text-right py-3 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr
                        key={ticket._id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="font-semibold">{ticket.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {ticket.category || "General"}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`text-xs font-bold uppercase ${getPriorityBadge(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={ticket.status}
                            onChange={(e) =>
                              handleStatusChange(ticket._id, e.target.value)
                            }
                            disabled={updatingId === ticket._id}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border bg-transparent cursor-pointer glow-input ${getStatusBadge(
                              ticket.status
                            )} ${
                              updatingId === ticket._id ? "opacity-50" : ""
                            }`}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option
                                key={opt.value}
                                value={opt.value}
                                className="bg-gray-900 text-white"
                              >
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <SLATimer
                            dueDate={ticket.dueDate}
                            status={ticket.status}
                            breached={ticket.breached}
                            size="sm"
                          />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors dynamic-border border hover:dynamic-text"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredTickets.length === 0 && !loading && (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-lg mb-2">No tasks found</p>
                    <p className="text-sm">
                      {statusFilter === "ALL"
                        ? "You have no assigned tasks yet"
                        : `No tasks with status "${statusFilter.replace(
                            "_",
                            " "
                          )}"`}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="card p-8 w-full max-w-2xl dynamic-shadow max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-black mb-2">
                  {selectedTicket.title}
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                      selectedTicket.status
                    )}`}
                  >
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                  <span
                    className={`text-xs font-bold uppercase ${getPriorityBadge(
                      selectedTicket.priority
                    )}`}
                  >
                    {selectedTicket.priority} Priority
                  </span>
                  <SLATimer
                    dueDate={selectedTicket.dueDate}
                    status={selectedTicket.status}
                    breached={selectedTicket.breached}
                    size="md"
                  />
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
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
                  {selectedTicket.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Category
                  </h4>
                  <p className="font-bold">
                    {selectedTicket.category || "General"}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Due Date
                  </h4>
                  <p className="font-bold">
                    {formatDate(selectedTicket.dueDate)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Reporter
                  </h4>
                  <p className="font-bold">
                    {selectedTicket.reporter?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Ticket ID
                  </h4>
                  <p className="font-bold dynamic-text">
                    #{selectedTicket._id?.slice(-8) || "N/A"}
                  </p>
                </div>
              </div>

              {selectedTicket.tags?.length > 0 && (
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded bg-white/10 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div>
                <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Update Status
                </h4>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => {
                    handleStatusChange(selectedTicket._id, e.target.value);
                    setSelectedTicket({
                      ...selectedTicket,
                      status: e.target.value,
                    });
                  }}
                  className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-700 glow-input font-bold"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comments Section */}
              <div>
                <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                  Discussion
                </h4>
                <Comments ticketId={selectedTicket._id} />
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => setSelectedTicket(null)}
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

// Stat Card Component
function StatCard({ label, value, color, icon }) {
  return (
    <div
      className="card card-hover p-5 transition-all"
      style={{ borderColor: `${color}30` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-black" style={{ color }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
