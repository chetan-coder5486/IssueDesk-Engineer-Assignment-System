import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/authSlice.js";
import ProfileDrawer from "../components/ProfileDrawer.jsx";

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
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const themeColor = departmentColors[user?.department] || "#a855f7";

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
    setMobileMenuOpen(false);
  };

  // Role-based navigation links
  const getNavLinks = () => {
    if (!user) {
      return [
        { to: "/", label: "Home", icon: "🏠" },
        { to: "/login", label: "Login", icon: "🔐" },
        { to: "/signup", label: "Sign Up", icon: "📝" },
      ];
    }

    switch (user.role) {
      case "ADMIN":
        return [{ to: "/admin-dashboard", label: "Dashboard", icon: "📊" }];
      case "ENGINEER":
        return [{ to: "/engineer-dashboard", label: "Dashboard", icon: "🔧" }];
      case "RANGER":
      default:
        return [{ to: "/user-dashboard", label: "Dashboard", icon: "📋" }];
    }
  };

  // Get the home link based on user role
  const getHomeLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "ADMIN":
        return "/admin-dashboard";
      case "ENGINEER":
        return "/engineer-dashboard";
      default:
        return "/user-dashboard";
    }
  };

  // Get role display name
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

  const navLinks = getNavLinks();
  const isActive = (path) => location.pathname === path;

  return (
    <>
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
            <Link to={getHomeLink()} className="flex items-center gap-3">
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
                  {user ? `${getRoleDisplayName()} Portal` : "Command Center"}
                </p>
              </div>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.to}
                  className={`nav-link px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-white/5 flex items-center gap-2 ${
                    isActive(link.to)
                      ? "nav-active text-white"
                      : "text-gray-300"
                  }`}
                  style={isActive(link.to) ? { color: themeColor } : {}}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User Section - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  {/* User Info - Clickable to open Profile */}
                  <button
                    onClick={() => setProfileOpen(true)}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                        {user.department} • {getRoleDisplayName()}
                      </p>
                    </div>
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-black font-bold text-sm"
                      style={{ backgroundColor: themeColor }}
                    >
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  </button>

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
                    className={`nav-link px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg ${
                      isActive("/login") ? "text-white" : "text-gray-300"
                    }`}
                    style={isActive("/login") ? { color: themeColor } : {}}
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
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              {/* User Info - Mobile (Clickable to open Profile) */}
              {user && (
                <button
                  onClick={() => {
                    setProfileOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 mb-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-black font-bold"
                    style={{ backgroundColor: themeColor }}
                  >
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {user.department} • {getRoleDisplayName()}
                    </p>
                  </div>
                  <span className="ml-auto text-gray-400 text-xs">
                    View Profile →
                  </span>
                </button>
              )}

              {/* Nav Links - Mobile */}
              <div className="space-y-1">
                {navLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-lg ${
                      isActive(link.to)
                        ? "bg-white/10 text-white"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                    style={isActive(link.to) ? { color: themeColor } : {}}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Logout - Mobile */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full mt-4 px-4 py-3 rounded-lg bg-red-500/20 text-sm font-bold text-red-400 uppercase tracking-wider border border-red-500/30"
                >
                  🚪 Logout
                </button>
              ) : (
                <div className="mt-4 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 rounded-lg bg-white/5 text-center text-sm font-bold text-gray-300 uppercase tracking-wider"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 rounded-lg text-center text-sm font-bold text-black uppercase tracking-wider"
                    style={{ backgroundColor: themeColor }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Profile Drawer - Outside nav to avoid stacking context issues */}
      <ProfileDrawer
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}
