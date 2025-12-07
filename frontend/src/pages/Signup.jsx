import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSignupError,
  resetSignupStatus,
  setSignupError,
  signupUser,
} from "../store/authSlice.js";

const Signup = () => {
  const [formData, setFormData] = useState({
    codeName: "",
    email: "",
    password: "",
    confirmPassword: "",
    rangerColor: "red",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { signupStatus, signupError } = useSelector((state) => state.auth);

  const loading = signupStatus === "loading";
  const error = signupError;

  useEffect(() => {
    if (signupStatus === "succeeded") {
      navigate("/login");
      dispatch(resetSignupStatus());
    }
  }, [signupStatus, navigate, dispatch]);

  const colors = [
    { name: "red", hex: "#ef4444" },
    { name: "blue", hex: "#3b82f6" },
    { name: "green", hex: "#22c55e" },
    { name: "yellow", hex: "#eab308" },
    { name: "pink", hex: "#ec4899" },
    { name: "black", hex: "#1f2937" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (error) {
      dispatch(clearSignupError());
    }
  };

  const handleColorSelect = (color) => {
    setFormData({ ...formData, rangerColor: color });
    if (error) {
      dispatch(clearSignupError());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      dispatch(
        setSignupError("Security key mismatch. Please confirm your password.")
      );
      return;
    }

    dispatch(
      signupUser({
        name: formData.codeName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: "RANGER",
        department: formData.rangerColor.toUpperCase(),
      })
    );
  };

  return (
    <div className="relative min-h-screen font-orbitron overflow-x-hidden bg-[#050505] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

        .font-orbitron { font-family: 'Orbitron', sans-serif; }

        .stars {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: #000 url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png') repeat;
          z-index: 0; animation: moveStars 100s linear infinite;
        }

        @keyframes moveStars {
          from { background-position: 0 0; }
          to { background-position: -10000px 5000px; }
        }

        .floating-card { animation: float 6s ease-in-out infinite; }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }

        .glow-input:focus {
          box-shadow: 0 0 20px #d946ef, inset 0 0 10px #d946ef;
          border-color: #f0abfc;
        }

        .neon-button {
          position: relative; z-index: 1; overflow: hidden; transition: 0.5s;
        }
        .neon-button:hover {
          box-shadow: 0 0 50px #c026d3; transform: scale(1.02);
        }

        .glitch { position: relative; color: white; }
        .glitch::before, .glitch::after {
          content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        }
        .glitch::before {
          left: 2px; text-shadow: -1px 0 #ff00c1; clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim-1 5s infinite linear alternate-reverse;
        }
        .glitch::after {
          left: -2px; text-shadow: -1px 0 #00fff9; clip: rect(44px, 450px, 56px, 0);
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

        .signup-bg {
          background-image: url('https://c4.wallpaperflare.com/wallpaper/122/456/260/movies-hollywood-movies-wallpaper-preview.jpg'); 
          background-size: cover; background-position: center; transition: transform 0.8s ease;
        }
        .image-container:hover .signup-bg { transform: scale(1.15); }
        
        .color-orb { transition: all 0.3s ease; }
        .color-orb:hover { transform: scale(1.2); }
        .color-orb.selected { transform: scale(1.3); box-shadow: 0 0 15px currentColor; border: 2px solid white; }
      `}</style>

      <div className="stars"></div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="flex max-w-6xl w-full bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-[0_0_80px_rgba(168,85,247,0.4)] border border-purple-500/50 overflow-hidden floating-card">
          <div className="hidden lg:flex w-5/12 relative overflow-hidden image-container group cursor-pointer">
            <div className="absolute inset-0 signup-bg"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-900/50 to-transparent mix-blend-hard-light"></div>

            <div className="relative z-10 p-10 flex flex-col justify-between h-full">
              <div className="border-l-4 border-cyan-400 pl-6">
                <h2
                  className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] glitch"
                  data-text="RECRUIT"
                >
                  RECRUIT
                </h2>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mt-2">
                  NEW RANGER
                </h2>
              </div>

              <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/30 transform group-hover:translate-x-2 transition-transform duration-300">
                <p className="text-cyan-300 text-sm font-semibold tracking-widest mb-2">
                  OBJECTIVE: ASSEMBLE
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  "The grid is expanding. We need new guardians to protect the
                  universe. Choose your color."
                </p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-7/12 p-10 md:p-12 relative">
            <div className="absolute top-0 right-0 p-6 opacity-30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-20 h-20 text-cyan-500 animate-pulse"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
            </div>

            <div className="mb-8">
              <h3 className="text-3xl font-bold text-white mb-2 tracking-wide">
                INITIALIZE SIGNUP
              </h3>
              <p className="text-cyan-400/80 uppercase tracking-[0.2em] text-sm">
                Create Your Legacy
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <input
                    id="codeName"
                    type="text"
                    placeholder="RANGER DESIGNATION (NAME)"
                    value={formData.codeName}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none glow-input transition-all placeholder-gray-600 font-bold tracking-wider text-sm"
                  />
                </div>
                <div className="relative group">
                  <input
                    id="email"
                    type="email"
                    placeholder="NEURAL LINK (EMAIL)"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none glow-input transition-all placeholder-gray-600 font-bold tracking-wider text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-widest mb-3">
                  Select Power Source
                </label>
                <div className="flex gap-4 justify-start">
                  {colors.map((color) => (
                    <div
                      key={color.name}
                      onClick={() => handleColorSelect(color.name)}
                      className={`w-10 h-10 rounded-full cursor-pointer color-orb ${
                        formData.rangerColor === color.name ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color.hex, color: color.hex }}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <input
                    id="password"
                    type="password"
                    placeholder="CREATE SECURITY KEY"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none glow-input transition-all placeholder-gray-600 font-bold tracking-wider text-sm"
                  />
                </div>
                <div className="relative group">
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="CONFIRM SECURITY KEY"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none glow-input transition-all placeholder-gray-600 font-bold tracking-wider text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full neon-button bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white font-black py-4 rounded-xl uppercase tracking-[0.15em] text-lg shadow-lg border border-white/10 disabled:opacity-50"
                >
                  {loading
                    ? "GENERATING MORPHER..."
                    : "INITIATE TRANSFORMATION"}
                </button>
              </div>

              {error && (
                <p className="text-rose-400 text-center text-sm tracking-wide">
                  {error}
                </p>
              )}

              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">Already active?</p>
                <Link
                  to="/login"
                  className="text-cyan-400 hover:text-white transition-colors text-sm uppercase tracking-widest border-b border-transparent hover:border-cyan-500 pb-1 mt-1 inline-block"
                >
                  Return to Login Hub
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
