import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../store/authSlice.js";
import {
  FaTimes,
  FaSignOutAlt,
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaIdBadge,
} from "react-icons/fa";

// Department color mapping
const departmentColors = {
  RED: "#ef4444",
  BLUE: "#3b82f6",
  GREEN: "#22c55e",
  YELLOW: "#eab308",
  PINK: "#ec4899",
  BLACK: "#6b7280",
};

const ProfileDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { myTickets } = useSelector((state) => state.tickets);

  const themeColor = departmentColors[user?.department] || "#a855f7";

  // Calculate stats from tickets
  const getIssueStats = () => {
    if (!myTickets || myTickets.length === 0) {
      return { solved: 0, pending: 0, working: 0, total: 0 };
    }
    return {
      solved: myTickets.filter(
        (t) => t.status === "RESOLVED" || t.status === "CLOSED"
      ).length,
      pending: myTickets.filter(
        (t) => t.status === "OPEN" || t.status === "PENDING_PARTS"
      ).length,
      working: myTickets.filter(
        (t) => t.status === "IN_PROGRESS" || t.status === "ASSIGNED"
      ).length,
      total: myTickets.length,
    };
  };

  // Get recent activity from tickets
  const getRecentActivity = () => {
    if (!myTickets || myTickets.length === 0) return [];
    return [...myTickets]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map((ticket) => ({
        id: ticket._id,
        title: ticket.title,
        date: new Date(ticket.updatedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        status: ticket.status,
      }));
  };

  const getRoleDisplayName = () => {
    if (!user) return "Guest";
    switch (user.role) {
      case "ADMIN":
        return "Administrator";
      case "ENGINEER":
        return "Engineer";
      case "RANGER":
        return "Ranger";
      default:
        return user.role;
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    onClose?.();
    navigate("/login");
  };

  if (!isOpen) return null;

  const stats = getIssueStats();
  const recentActivity = getRecentActivity();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md overflow-y-auto shadow-2xl"
        style={{
          zIndex: 9999,
          backgroundColor: "#0f0f0f",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          animation: "slideIn 0.3s ease-out",
        }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div
          className="sticky top-0 backdrop-blur-sm p-4 flex items-center justify-between"
          style={{
            backgroundColor: "rgba(15,15,15,0.95)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            zIndex: 10,
          }}
        >
          <h2 className="text-xl font-bold text-white">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {/* Avatar & Basic Info */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                width: "96px",
                height: "96px",
                margin: "0 auto 16px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                fontWeight: "bold",
                color: "black",
                backgroundColor: themeColor,
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              }}
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "white",
                marginBottom: "8px",
              }}
            >
              {user?.name || "User"}
            </h3>
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "black",
                backgroundColor: themeColor,
              }}
            >
              {getRoleDisplayName()}
            </span>
          </div>

          {/* User Details */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#d1d5db",
                marginBottom: "12px",
              }}
            >
              <FaEnvelope style={{ color: "#6b7280" }} />
              <span style={{ fontSize: "14px" }}>
                {user?.email || "No email"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#d1d5db",
                marginBottom: "12px",
              }}
            >
              <FaBuilding style={{ color: "#6b7280" }} />
              <span style={{ fontSize: "14px" }}>
                Department:{" "}
                <span style={{ color: themeColor, fontWeight: "bold" }}>
                  {user?.department || "N/A"}
                </span>
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#d1d5db",
              }}
            >
              <FaIdBadge style={{ color: "#6b7280" }} />
              <span
                style={{
                  fontSize: "14px",
                  fontFamily: "monospace",
                  color: "#9ca3af",
                }}
              >
                ID: {user?._id?.slice(-8) || user?.id?.slice(-8) || "N/A"}
              </span>
            </div>
          </div>

          {/* Stats */}
          {stats.total > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: "12px",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#4ade80",
                  }}
                >
                  {stats.solved}
                </div>
                <div
                  style={{ fontSize: "12px", color: "rgba(74,222,128,0.7)" }}
                >
                  Resolved
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "rgba(234,179,8,0.1)",
                  border: "1px solid rgba(234,179,8,0.2)",
                  borderRadius: "12px",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#facc15",
                  }}
                >
                  {stats.working}
                </div>
                <div
                  style={{ fontSize: "12px", color: "rgba(250,204,21,0.7)" }}
                >
                  In Progress
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "12px",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#f87171",
                  }}
                >
                  {stats.pending}
                </div>
                <div
                  style={{ fontSize: "12px", color: "rgba(248,113,113,0.7)" }}
                >
                  Pending
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "12px",
                }}
              >
                Recent Activity
              </h4>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderRadius: "8px",
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor:
                          activity.status === "RESOLVED" ||
                          activity.status === "CLOSED"
                            ? "#22c55e"
                            : activity.status === "IN_PROGRESS" ||
                              activity.status === "ASSIGNED"
                            ? "#eab308"
                            : "#ef4444",
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "white",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {activity.title}
                      </p>
                      <p style={{ fontSize: "12px", color: "#6b7280" }}>
                        {activity.date}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {activity.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Activity */}
          {recentActivity.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "#6b7280",
              }}
            >
              <FaUser
                size={32}
                style={{ margin: "0 auto 8px", opacity: 0.5 }}
              />
              <p style={{ fontSize: "14px" }}>No recent activity</p>
            </div>
          )}
        </div>

        {/* Footer - Logout */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "rgba(15,15,15,0.95)",
            backdropFilter: "blur(8px)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "16px",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(239,68,68,0.2)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = "rgba(239,68,68,0.3)")
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = "rgba(239,68,68,0.2)")
            }
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileDrawer;
