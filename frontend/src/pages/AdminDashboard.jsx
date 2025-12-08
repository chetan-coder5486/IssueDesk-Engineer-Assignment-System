import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchEngineers,
  fetchDashboardStats,
  fetchAllUsers,
} from "../store/adminSlice.js";
import {
  fetchAllTickets,
  assignTicket,
  updateTicketStatus,
  deleteTicket,
} from "../store/ticketSlice.js";
import Navbar from "./Navbar.jsx";
import SLATimer from "../components/SLATimer.jsx";

// Department color mapping
const departmentColors = {
  RED: "#ef4444",
  BLUE: "#3b82f6",
  GREEN: "#22c55e",
  YELLOW: "#eab308",
  PINK: "#ec4899",
  BLACK: "#6b7280",
};

const priorityColors = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
};

const statusColors = {
  OPEN: "#ef4444",
  ASSIGNED: "#3b82f6",
  IN_PROGRESS: "#f59e0b",
  PENDING_PARTS: "#a855f7",
  RESOLVED: "#22c55e",
  CLOSED: "#6b7280",
};

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    engineers,
    stats,
    loading: adminLoading,
  } = useSelector((state) => state.admin);
  const { tickets, loading: ticketsLoading } = useSelector(
    (state) => state.tickets
  );

  // UI State
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Theme color - admin uses purple
  const themeColor = "#a855f7";
  const themeGlow = `${themeColor}80`;

  const dynamicStyles = {
    "--theme-color": themeColor,
    "--theme-glow": themeGlow,
    "--theme-gradient": `linear-gradient(to right, ${themeColor}, #6366f1)`,
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Load all data
    dispatch(fetchDashboardStats());
    dispatch(fetchEngineers());
    dispatch(fetchAllTickets());
    dispatch(fetchAllUsers());
  }, [user, navigate, dispatch]);

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.category?.toLowerCase().includes(query) ||
          t.reporter?.name?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== "ALL") {
      result = result.filter((t) => t.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== "ALL") {
      result = result.filter((t) => t.priority === filterPriority);
    }

    // Sorting
    result.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === "createdAt") {
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
      } else if (sortBy === "priority") {
        const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        aVal = order[a.priority] || 0;
        bVal = order[b.priority] || 0;
      } else if (sortBy === "status") {
        aVal = a.status;
        bVal = b.status;
      }
      if (sortOrder === "desc") return bVal > aVal ? 1 : -1;
      return aVal > bVal ? 1 : -1;
    });

    return result;
  }, [tickets, searchQuery, filterStatus, filterPriority, sortBy, sortOrder]);

  // Unassigned tickets (need attention)
  const unassignedTickets = useMemo(
    () => tickets.filter((t) => !t.assignee && t.status === "OPEN"),
    [tickets]
  );

  // Handle assign ticket
  const handleAssignTicket = async (engineerId) => {
    if (selectedTicket && engineerId) {
      await dispatch(
        assignTicket({ ticketId: selectedTicket._id, assigneeId: engineerId })
      );
      // Refresh engineers to update workload counts
      dispatch(fetchEngineers());
      dispatch(fetchDashboardStats());
      setShowAssignModal(false);
      setSelectedTicket(null);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (ticketId, newStatus) => {
    await dispatch(updateTicketStatus({ ticketId, status: newStatus }));
    // Refresh engineers to update workload counts
    dispatch(fetchEngineers());
    dispatch(fetchDashboardStats());
  };

  // Handle delete ticket
  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      await dispatch(deleteTicket(ticketId));
      // Refresh engineers to update workload counts
      dispatch(fetchEngineers());
      dispatch(fetchDashboardStats());
      setShowTicketDetail(false);
      setSelectedTicket(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const color = statusColors[status] || statusColors.OPEN;
    return {
      backgroundColor: `${color}20`,
      color: color,
      borderColor: `${color}50`,
    };
  };

  const getPriorityBadge = (priority) => {
    const color = priorityColors[priority] || priorityColors.MEDIUM;
    return {
      backgroundColor: `${color}20`,
      color: color,
      borderColor: `${color}50`,
    };
  };

  if (!user) return null;

  const loading = adminLoading || ticketsLoading;

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

        .glow-input:focus {
          box-shadow: 0 0 20px var(--theme-glow), inset 0 0 10px var(--theme-glow);
          border-color: var(--theme-color);
        }

        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: var(--theme-color); border-radius: 3px; }

        .tab-active {
          border-bottom: 2px solid var(--theme-color);
          color: var(--theme-color);
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
        }
      `}</style>

      {/* Stars Background */}
      <div className="stars"></div>

      {/* Navbar */}
      <Navbar />

      {/* Main Container */}
      <div className="relative z-10 pt-6 px-6 pb-12">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold dynamic-gradient-text">
                Admin Command Center
              </h1>
              <p className="text-gray-400 mt-1">Issue Desk Management System</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Administrator</p>
                <p className="text-lg font-semibold dynamic-text">
                  {user?.name}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full dynamic-bg flex items-center justify-center text-xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex gap-8 border-b border-gray-800">
            {[
              { id: "overview", label: "Overview" },
              { id: "tickets", label: "All Tickets" },
              { id: "assignment", label: "Assignment Queue" },
              { id: "engineers", label: "Engineers" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "tab-active"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-t-transparent dynamic-border rounded-full animate-spin"></div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && !loading && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <StatCard
                  label="Total Tickets"
                  value={stats.totalTickets}
                  color="#a855f7"
                />
                <StatCard
                  label="Open"
                  value={stats.openTickets}
                  color="#ef4444"
                />
                <StatCard
                  label="Assigned"
                  value={stats.assignedTickets}
                  color="#3b82f6"
                />
                <StatCard
                  label="In Progress"
                  value={stats.inProgressTickets}
                  color="#f59e0b"
                />
                <StatCard
                  label="Resolved"
                  value={stats.resolvedTickets}
                  color="#22c55e"
                />
                <StatCard
                  label="Critical"
                  value={stats.criticalTickets}
                  color="#dc2626"
                />
              </div>

              {/* Engineers & Unassigned Row */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Engineers Status */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Engineers ({stats.onlineEngineers}/{stats.totalEngineers}{" "}
                    Online)
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                    {engineers.map((eng) => (
                      <div
                        key={eng._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{
                              backgroundColor:
                                departmentColors[eng.department] || "#6b7280",
                            }}
                          >
                            {eng.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{eng.name}</p>
                            <p className="text-xs text-gray-400">
                              {eng.department} Team
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">
                            {eng.workloadScore || 0} tasks
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              eng.isOnline ? "bg-green-500" : "bg-gray-500"
                            }`}
                          ></span>
                        </div>
                      </div>
                    ))}
                    {engineers.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No engineers found
                      </p>
                    )}
                  </div>
                </div>

                {/* Unassigned Tickets */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Unassigned Tickets ({unassignedTickets.length})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                    {unassignedTickets.slice(0, 10).map((ticket) => (
                      <div
                        key={ticket._id}
                        className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowAssignModal(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {ticket.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {ticket.reporter?.name} ·{" "}
                              {formatDate(ticket.createdAt)}
                            </p>
                          </div>
                          <span
                            className="status-badge ml-2"
                            style={getPriorityBadge(ticket.priority)}
                          >
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                    {unassignedTickets.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        All tickets are assigned! 🎉
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Priority Distribution
                </h3>
                <div className="flex gap-4">
                  {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((priority) => {
                    const count = tickets.filter(
                      (t) =>
                        t.priority === priority &&
                        !["RESOLVED", "CLOSED"].includes(t.status)
                    ).length;
                    const total = tickets.filter(
                      (t) => !["RESOLVED", "CLOSED"].includes(t.status)
                    ).length;
                    const percentage =
                      total > 0 ? Math.round((count / total) * 100) : 0;

                    return (
                      <div key={priority} className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-400">
                            {priority}
                          </span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: priorityColors[priority],
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === "tickets" && !loading && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="card p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 min-w-[200px] px-4 py-2 rounded-lg bg-black/50 border border-gray-700 focus:outline-none glow-input"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-black/50 border border-gray-700 focus:outline-none"
                  >
                    <option value="ALL">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="PENDING_PARTS">Pending Parts</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-black/50 border border-gray-700 focus:outline-none"
                  >
                    <option value="ALL">All Priority</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [by, order] = e.target.value.split("-");
                      setSortBy(by);
                      setSortOrder(order);
                    }}
                    className="px-4 py-2 rounded-lg bg-black/50 border border-gray-700 focus:outline-none"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="priority-desc">Priority (High-Low)</option>
                    <option value="priority-asc">Priority (Low-High)</option>
                  </select>
                </div>
              </div>

              {/* Tickets Table */}
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Title
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Reporter
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Assignee
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Priority
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Status
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          SLA
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Created
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredTickets.map((ticket) => (
                        <tr
                          key={ticket._id}
                          className="hover:bg-white/5 transition cursor-pointer"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowTicketDetail(true);
                          }}
                        >
                          <td className="p-4">
                            <p className="font-medium truncate max-w-[200px]">
                              {ticket.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              {ticket.category}
                            </p>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{
                                  backgroundColor:
                                    departmentColors[
                                      ticket.reporter?.department
                                    ] || "#6b7280",
                                }}
                              >
                                {ticket.reporter?.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm">
                                {ticket.reporter?.name || "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            {ticket.assignee ? (
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                  style={{
                                    backgroundColor:
                                      departmentColors[
                                        ticket.assignee?.department
                                      ] || "#6b7280",
                                  }}
                                >
                                  {ticket.assignee?.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                                </div>
                                <span className="text-sm">
                                  {ticket.assignee?.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-red-400 text-sm">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className="status-badge"
                              style={getPriorityBadge(ticket.priority)}
                            >
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className="status-badge"
                              style={getStatusBadge(ticket.status)}
                            >
                              {ticket.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-4">
                            <SLATimer
                              dueDate={ticket.dueDate}
                              status={ticket.status}
                              breached={ticket.breached}
                              size="sm"
                            />
                          </td>
                          <td className="p-4 text-sm text-gray-400">
                            {formatDate(ticket.createdAt)}
                          </td>
                          <td className="p-4">
                            <div
                              className="flex gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setShowAssignModal(true);
                                }}
                                className="px-3 py-1 text-xs rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
                              >
                                Assign
                              </button>
                              <button
                                onClick={() => handleDeleteTicket(ticket._id)}
                                className="px-3 py-1 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredTickets.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No tickets found
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Assignment Queue Tab */}
          {activeTab === "assignment" && !loading && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Unassigned Queue */}
              <div className="lg:col-span-2 card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Assignment Queue ({unassignedTickets.length} pending)
                </h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
                  {unassignedTickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition border border-transparent hover:border-purple-500/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="status-badge"
                              style={getPriorityBadge(ticket.priority)}
                            >
                              {ticket.priority}
                            </span>
                            <span className="text-xs text-gray-500">
                              {ticket.category}
                            </span>
                          </div>
                          <p className="font-medium">{ticket.title}</p>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {ticket.description || "No description provided"}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Reported by {ticket.reporter?.name} ·{" "}
                            {formatDate(ticket.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowAssignModal(true);
                          }}
                          className="neon-button px-4 py-2 rounded-lg text-sm font-medium text-white"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                  {unassignedTickets.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-4xl mb-3">🎉</p>
                      <p className="text-gray-400">
                        All tickets have been assigned!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Available Engineers */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Available Engineers
                </h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
                  {[...engineers]
                    .filter((e) => e.isOnline)
                    .sort(
                      (a, b) => (a.workloadScore || 0) - (b.workloadScore || 0)
                    )
                    .map((eng) => (
                      <div
                        key={eng._id}
                        className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{
                              backgroundColor:
                                departmentColors[eng.department] || "#6b7280",
                            }}
                          >
                            {eng.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{eng.name}</p>
                            <p className="text-xs text-gray-400">
                              {eng.department} Team
                            </p>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            Current Workload
                          </span>
                          <span className="font-medium">
                            {eng.workloadScore || 0} tasks
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                (eng.workloadScore || 0) * 10,
                                100
                              )}%`,
                              backgroundColor:
                                (eng.workloadScore || 0) > 7
                                  ? "#ef4444"
                                  : (eng.workloadScore || 0) > 4
                                  ? "#f59e0b"
                                  : "#22c55e",
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  {engineers.filter((e) => e.isOnline).length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No engineers online
                    </p>
                  )}

                  <div className="border-t border-gray-800 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">
                      Offline Engineers
                    </h4>
                    {engineers
                      .filter((e) => !e.isOnline)
                      .map((eng) => (
                        <div
                          key={eng._id}
                          className="flex items-center gap-3 p-2 rounded-lg opacity-50"
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{
                              backgroundColor:
                                departmentColors[eng.department] || "#6b7280",
                            }}
                          >
                            {eng.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm">{eng.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Engineers Tab */}
          {activeTab === "engineers" && !loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {engineers.map((eng) => (
                <div
                  key={eng._id}
                  className="card p-6 card-hover transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
                      style={{
                        backgroundColor:
                          departmentColors[eng.department] || "#6b7280",
                      }}
                    >
                      {eng.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold">{eng.name}</p>
                      <p className="text-sm text-gray-400">{eng.email}</p>
                    </div>
                    <span
                      className={`w-3 h-3 rounded-full ${
                        eng.isOnline ? "bg-green-500" : "bg-gray-500"
                      }`}
                    ></span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Department</span>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${
                            departmentColors[eng.department]
                          }20`,
                          color: departmentColors[eng.department],
                        }}
                      >
                        {eng.department}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Status</span>
                      <span
                        className={`text-sm font-medium ${
                          eng.isOnline ? "text-green-400" : "text-gray-500"
                        }`}
                      >
                        {eng.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Workload</span>
                      <span className="text-sm font-medium">
                        {eng.workloadScore || 0} tasks
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (eng.workloadScore || 0) * 10,
                            100
                          )}%`,
                          backgroundColor:
                            (eng.workloadScore || 0) > 7
                              ? "#ef4444"
                              : (eng.workloadScore || 0) > 4
                              ? "#f59e0b"
                              : "#22c55e",
                        }}
                      ></div>
                    </div>
                  </div>

                  {eng.skills && eng.skills.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-xs text-gray-400 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {eng.skills.slice(0, 4).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-full text-xs bg-white/10 text-gray-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {engineers.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No engineers found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Assign Ticket</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedTicket(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Ticket Info */}
            <div className="p-4 rounded-lg bg-white/5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="status-badge"
                  style={getPriorityBadge(selectedTicket.priority)}
                >
                  {selectedTicket.priority}
                </span>
                <span className="text-xs text-gray-500">
                  {selectedTicket.category}
                </span>
              </div>
              <p className="font-medium">{selectedTicket.title}</p>
              <p className="text-sm text-gray-400 mt-1">
                {selectedTicket.description || "No description"}
              </p>
            </div>

            {/* Engineer Selection */}
            <h4 className="text-sm font-medium text-gray-400 mb-3">
              Select Engineer
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {[...engineers]
                .sort((a, b) => (a.workloadScore || 0) - (b.workloadScore || 0))
                .map((eng) => (
                  <button
                    key={eng._id}
                    onClick={() => handleAssignTicket(eng._id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 hover:border-purple-500/50 border border-transparent transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{
                          backgroundColor:
                            departmentColors[eng.department] || "#6b7280",
                        }}
                      >
                        {eng.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{eng.name}</p>
                        <p className="text-xs text-gray-400">
                          {eng.department} · {eng.workloadScore || 0} tasks
                        </p>
                      </div>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        eng.isOnline ? "bg-green-500" : "bg-gray-500"
                      }`}
                    ></span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showTicketDetail && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Ticket Details</h3>
              <button
                onClick={() => {
                  setShowTicketDetail(false);
                  setSelectedTicket(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="status-badge"
                  style={getPriorityBadge(selectedTicket.priority)}
                >
                  {selectedTicket.priority}
                </span>
                <span
                  className="status-badge"
                  style={getStatusBadge(selectedTicket.status)}
                >
                  {selectedTicket.status.replace("_", " ")}
                </span>
                <SLATimer
                  dueDate={selectedTicket.dueDate}
                  status={selectedTicket.status}
                  breached={selectedTicket.breached}
                  size="md"
                />
                <span className="text-sm text-gray-400">
                  {selectedTicket.category}
                </span>
              </div>

              <h4 className="text-lg font-semibold">{selectedTicket.title}</h4>
              <p className="text-gray-300">
                {selectedTicket.description || "No description provided"}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                <div>
                  <p className="text-xs text-gray-500">Reporter</p>
                  <p className="font-medium">
                    {selectedTicket.reporter?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Assignee</p>
                  <p className="font-medium">
                    {selectedTicket.assignee?.name || "Unassigned"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="font-medium">
                    {formatDate(selectedTicket.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Updated</p>
                  <p className="font-medium">
                    {formatDate(selectedTicket.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Status Update */}
              <div className="pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "OPEN",
                    "ASSIGNED",
                    "IN_PROGRESS",
                    "PENDING_PARTS",
                    "RESOLVED",
                    "CLOSED",
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        handleStatusUpdate(selectedTicket._id, status)
                      }
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        selectedTicket.status === status
                          ? "ring-2 ring-white"
                          : "hover:opacity-80"
                      }`}
                      style={getStatusBadge(status)}
                    >
                      {status.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowTicketDetail(false);
                    setShowAssignModal(true);
                  }}
                  className="neon-button px-4 py-2 rounded-lg text-sm font-medium text-white"
                >
                  Assign / Reassign
                </button>
                <button
                  onClick={() => handleDeleteTicket(selectedTicket._id)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                >
                  Delete Ticket
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
function StatCard({ label, value, color }) {
  return (
    <div className="card p-4 card-hover transition-all">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value || 0}
      </p>
    </div>
  );
}
