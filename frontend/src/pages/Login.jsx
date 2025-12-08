import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearLoginError, loginUser } from "../store/authSlice.js";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loginStatus, loginError, user } = useSelector((state) => state.auth);

  const loading = loginStatus === "loading";
  const error = loginError;

  useEffect(() => {
    if (loginStatus === "succeeded" && user) {
      // Role-based redirect
      if (user.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else if (user.role === "ENGINEER") {
        navigate("/engineer-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    }
  }, [loginStatus, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (error) {
      dispatch(clearLoginError());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })
    );
  };

  return (
    <div className="relative min-h-screen font-orbitron overflow-hidden bg-[#050505] text-white">
      {/* NOTE: बेहतर परफॉरमेंस के लिए यह <style> टैग अपने index.css में डालना बेहतर होगा, 
         लेकिन डायरेक्ट काम करने के लिए मैंने इसे यहीं रखा है।
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

        .font-orbitron {
          font-family: 'Orbitron', sans-serif;
        }

        .stars {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000 url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png') repeat;
          z-index: 0;
          animation: moveStars 100s linear infinite;
        }

        @keyframes moveStars {
          from { background-position: 0 0; }
          to { background-position: -10000px 5000px; }
        }

        .floating-card {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }

        .glow-input:focus {
          box-shadow: 0 0 20px #d946ef, inset 0 0 10px #d946ef;
          border-color: #f0abfc;
        }

        .neon-button {
          position: relative;
          z-index: 1;
          overflow: hidden;
          transition: 0.5s;
        }

        .neon-button:hover {
          box-shadow: 0 0 50px #c026d3;
          transform: scale(1.02);
        }

        .glitch {
          position: relative;
          color: white;
        }

        .glitch::before, .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch::before {
          left: 2px;
          text-shadow: -1px 0 #ff00c1;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim-1 5s infinite linear alternate-reverse;
        }

        .glitch::after {
          left: -2px;
          text-shadow: -1px 0 #00fff9;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim-2 5s infinite linear alternate-reverse;
        }

        @keyframes glitch-anim-1 {
          0% { clip: rect(20px, 9999px, 10px, 0); }
          100% { clip: rect(80px, 9999px, 90px, 0); }
        }

        @keyframes glitch-anim-2 {
          0% { clip: rect(10px, 9999px, 80px, 0); }
          100% { clip: rect(90px, 9999px, 10px, 0); }
        }

        .ranger-bg {
          background-image: url('https://wallpapers.com/images/hd/power-rangers-4k-desktop-g9d5e3y8a9d5e3y8.jpg'); 
          background-size: cover;
          background-position: center;
          transition: transform 0.8s ease;
        }
        
        .image-container:hover .ranger-bg {
          transform: scale(1.15);
        }
      `}</style>

      {/* Moving Stars Background */}
      <div className="stars"></div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="flex max-w-6xl w-full bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-[0_0_80px_rgba(168,85,247,0.4)] border border-purple-500/50 overflow-hidden floating-card">
          {/* Left Side: Image & Branding */}
          <div className="hidden lg:flex w-5/12 relative overflow-hidden image-container group cursor-pointer">
            <div className="absolute inset-0 ranger-bg"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-900/50 to-transparent mix-blend-hard-light"></div>

            <div className="relative z-10 p-10 flex flex-col justify-between h-full">
              <div className="border-l-4 border-pink-500 pl-6">
                <h2
                  className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] glitch"
                  data-text="ZORDON"
                >
                  ZORDON
                </h2>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mt-2">
                  COMMAND HUB
                </h2>
              </div>

              <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-purple-500/30 transform group-hover:translate-x-2 transition-transform duration-300">
                <p className="text-pink-300 text-sm font-semibold tracking-widest mb-2">
                  STATUS: CRITICAL
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  "Alpha, recruit a team of teenagers with attitude. The grid
                  connection is stable."
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="w-full lg:w-7/12 p-10 md:p-16 relative">
            {/* Spinning Radar Icon */}
            <div className="absolute top-0 right-0 p-6 opacity-30">
              <svg
                className="w-24 h-24 text-purple-600 animate-spin"
                style={{ animationDuration: "10s" }}
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="10 5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
              </svg>
            </div>

            <div className="mb-10">
              <h3 className="text-4xl font-bold text-white mb-2 tracking-wide">
                IDENTITY VERIFICATION
              </h3>
              <p className="text-purple-400/80 uppercase tracking-[0.2em] text-sm">
                Enter Access Codes
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <input
                  id="email"
                  type="email"
                  placeholder="NEURAL LINK (EMAIL)"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="relative w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none glow-input transition-all placeholder-gray-600 font-bold tracking-wider"
                />
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <input
                  id="password"
                  type="password"
                  placeholder="SECURITY KEY"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="relative w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none glow-input transition-all placeholder-gray-600 font-bold tracking-wider"
                />
              </div>

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center text-gray-400 cursor-pointer hover:text-white transition">
                  <input
                    type="checkbox"
                    className="mr-2 accent-purple-600 h-4 w-4"
                  />{" "}
                  Remember Signal
                </label>
                <a
                  href="#"
                  className="text-pink-500 hover:text-pink-300 hover:shadow-[0_0_10px_#ec4899] transition-all"
                >
                  Breached Protocol?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full neon-button bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 text-white font-black py-5 rounded-xl uppercase tracking-[0.15em] text-lg shadow-lg border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "CONNECTING TO GRID..."
                  : "INITIATE MORPHIN SEQUENCE"}
              </button>

              {error && (
                <p className="text-red-400 text-center text-sm tracking-wide">
                  {error}
                </p>
              )}

              <div className="mt-8 text-center">
                <Link
                  to="/signup"
                  className="text-gray-500 hover:text-white transition-colors text-sm uppercase tracking-widest border-b border-transparent hover:border-purple-500 pb-1 inline-block"
                >
                  Request New Power Coin (Sign Up)
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
