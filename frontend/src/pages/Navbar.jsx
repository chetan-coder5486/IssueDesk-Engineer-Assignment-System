import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/authSlice.js";

// Department color mapping
const departmentColors = {
  RED: "#ef4444",
  BLUE: "#3b82f6",
  GREEN: "#22c55e",
  YELLOW: "#eab308",
  PINK: "#ec4899",
  BLACK: "#6b7280",
};

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const themeColor = departmentColors[user?.department] || "#a855f7";

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  // Role-based navigation links
  const getNavLinks = () => {
    if (!user) {
      return [
        { to: "/login", label: "Login" },
        { to: "/signup", label: "Sign Up" },
      ];
    }

    if (user.role === "ADMIN") {
      return [
        { to: "/admin-dashboard", label: "Command Center" },
        { to: "/admin-dashboard", label: "Assignments" },
        { to: "/admin-dashboard", label: "Engineers" },
      ];
    }

    if (user.role === "ENGINEER") {
      return [
        { to: "/engineer-dashboard", label: "Dashboard" },
        { to: "/engineer-dashboard", label: "My Tasks", hash: "#tasks" },
      ];
    }

    // RANGER (regular user)
    return [
      { to: "/user-dashboard", label: "Dashboard" },
      { to: "/user-dashboard", label: "My Issues", hash: "#issues" },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md font-orbitron"
      style={{ "--theme-color": themeColor }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        .nav-glow:hover { box-shadow: 0 0 15px var(--theme-color); }
        .nav-link { transition: all 0.2s ease; }
        .nav-link:hover { color: var(--theme-color); }
        .nav-active { color: var(--theme-color); border-bottom: 2px solid var(--theme-color); }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link
            to={
              user
                ? user.role === "ADMIN"
                  ? "/admin-dashboard"
                  : user.role === "ENGINEER"
                  ? "/engineer-dashboard"
                  : "/user-dashboard"
                : "/"
            }
            className="flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-black font-black text-lg"
              style={{ backgroundColor: themeColor }}
            >
              Z
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-white tracking-tight">
                ZORDON HUB
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                {user ? `${user.role} Portal` : "Command Center"}
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.to}
                className="nav-link px-4 py-2 text-sm font-bold text-gray-300 uppercase tracking-wider rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* User Info */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {user.department} • {user.role}
                    </p>
                  </div>
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-black font-bold text-sm"
                    style={{ backgroundColor: themeColor }}
                  >
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="nav-glow px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-xs font-bold text-gray-300 hover:text-red-400 uppercase tracking-wider transition-all border border-white/10 hover:border-red-500/50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-link px-4 py-2 text-sm font-bold text-gray-300 uppercase tracking-wider"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="nav-glow px-4 py-2 rounded-lg text-sm font-bold text-black uppercase tracking-wider"
                  style={{ backgroundColor: themeColor }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-400 hover:text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
