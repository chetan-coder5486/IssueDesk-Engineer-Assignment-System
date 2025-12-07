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
  const [selectedColor, setSelectedColor] = useState("#ef4444"); // Default RED
  const [showPasswordRules, setShowPasswordRules] = useState(false); // Helper text toggle
  const [passwordError, setPasswordError] = useState(""); // Error state for validation

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "RED",
    role: "RANGER",
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

  // Colors Configuration
  const colors = [
    { hex: "#ef4444", name: "RED" },
    { hex: "#3b82f6", name: "BLUE" },
    { hex: "#22c55e", name: "GREEN" },
    { hex: "#eab308", name: "YELLOW" },
    { hex: "#ec4899", name: "PINK" },
    { hex: "#111827", name: "BLACK" },
  ];

  // Dynamic Style Object
  const dynamicStyles = {
    "--theme-color": selectedColor,
    "--theme-glow": `${selectedColor}80`,
    "--theme-gradient":
      selectedColor === "#111827"
        ? `linear-gradient(to right, ${selectedColor}, #6b7280)`
        : `linear-gradient(to right, ${selectedColor}, #a855f7)`,
  };

  const validatePassword = (password) => {
    // Regex: 8-12 chars, 1 Uppercase, 1 Digit, 1 Special Char
    // Allowed special chars: !@#$%^&*
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (id === "password") {
      if (value.length === 0) {
        setPasswordError("");
      } else if (!validatePassword(value)) {
        setPasswordError(
          "Password must be 8-12 chars with 1 uppercase, 1 digit, 1 special (!@#$%^&*)"
        );
      } else {
        setPasswordError("");
      }
    }

    if (error) {
      dispatch(clearSignupError());
    }
  };

  const handleColorSelect = (color) => {
    setFormData((prev) => ({ ...prev, department: color.name }));
    setSelectedColor(color.hex);
    if (error) {
      dispatch(clearSignupError());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordError) {
      dispatch(setSignupError("Please meet the password requirements."));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      dispatch(
        setSignupError("Security key mismatch. Please confirm your password.")
      );
      return;
    }

    dispatch(
      signupUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        department: formData.department,
      })
    );
  };

  return (
    <div
      className="relative min-h-screen font-orbitron overflow-hidden bg-[#050505] text-white"
      style={dynamicStyles}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

        .font-orbitron { font-family: 'Orbitron', sans-serif; }

        .dynamic-text { color: var(--theme-color); transition: color 0.5s ease; }
        .dynamic-border { border-color: var(--theme-color); transition: border-color 0.5s ease; }
        
        /* Dynamic Error Class */
        .input-error { border-color: #ef4444 !important; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5) !important; }
        .text-error { color: #ef4444; font-weight: bold; text-shadow: 0 0 5px #ef4444; }

        .dynamic-gradient-text {
            background: var(--theme-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            transition: background 0.5s ease;
        }

        .dynamic-shadow {
            box-shadow: 0 0 80px var(--theme-glow);
            transition: box-shadow 0.5s ease;
        }

        .stars {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000 url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png') repeat;
            z-index: 0; animation: moveStars 100s linear infinite;
        }
        @keyframes moveStars { from { background-position: 0 0; } to { background-position: -10000px 5000px; } }

        .floating-card { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }

        .glow-input:focus {
            box-shadow: 0 0 20px var(--theme-glow), inset 0 0 10px var(--theme-glow);
            border-color: var(--theme-color);
        }

        .neon-button {
            position: relative; z-index: 1; overflow: hidden; transition: 0.5s;
            background: linear-gradient(to right, var(--theme-color), #4c1d95, var(--theme-color));
            background-size: 200% auto;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .neon-button:hover {
            box-shadow: 0 0 40px var(--theme-glow);
            transform: scale(1.02);
            background-position: right center;
        }

        .glitch { position: relative; color: white; }
        .glitch::before, .glitch::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .glitch::before { left: 2px; text-shadow: -1px 0 #ff00c1; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim-1 5s infinite linear alternate-reverse; }
        .glitch::after { left: -2px; text-shadow: -1px 0 #00fff9; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim-2 5s infinite linear alternate-reverse; }
        @keyframes glitch-anim-1 { 0% { clip: rect(20px, 9999px, 10px, 0); } 100% { clip: rect(80px, 9999px, 90px, 0); } }
        @keyframes glitch-anim-2 { 0% { clip: rect(10px, 9999px, 80px, 0); } 100% { clip: rect(90px, 9999px, 10px, 0); } }

        .signup-bg { background-image: url('https://c4.wallpaperflare.com/wallpaper/122/456/260/movies-hollywood-movies-wallpaper-preview.jpg'); background-size: cover; background-position: center; transition: transform 0.8s ease; }
        .image-container:hover .signup-bg { transform: scale(1.15); }

        .color-orb { width: 40px; height: 40px; border-radius: 50%; cursor: pointer; transition: all 0.3s ease; position: relative; border: 2px solid rgba(255,255,255,0.1); }
        .color-orb:hover { transform: scale(1.2); }
        .color-orb.selected { transform: scale(1.3); border: 3px solid white; box-shadow: 0 0 20px currentColor; }
        
        .helper-text { font-size: 10px; color: #94a3b8; margin-top: 5px; letter-spacing: 0.05em; animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="stars"></div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>

        <div
          className="flex max-w-6xl w-full bg-gray-900/90 backdrop-blur-xl rounded-3xl dynamic-shadow border dynamic-border overflow-hidden floating-card"
          style={{ borderWidth: "1px" }}
        >
          <div className="hidden lg:flex w-5/12 relative overflow-hidden image-container group cursor-pointer">
            <div className="absolute inset-0 signup-bg"></div>
            <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

            <div className="relative z-10 p-10 flex flex-col justify-between h-full">
              <div className="border-l-4 dynamic-border pl-6">
                <h2
                  className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] glitch"
                  data-text="RECRUIT"
                >
                  RECRUIT
                </h2>
                <h2 className="text-3xl font-bold dynamic-gradient-text mt-2">
                  NEW RANGER
                </h2>
              </div>
              <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border dynamic-border transform group-hover:translate-x-2 transition-transform duration-300">
                <p className="dynamic-text text-sm font-semibold tracking-widest mb-2">
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
                className="w-20 h-20 dynamic-text animate-pulse"
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
              <p className="dynamic-text uppercase tracking-[0.2em] text-sm font-bold">
                Create Your Legacy
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <input
                    id="name"
                    type="text"
                    placeholder="RANGER DESIGNATION (NAME)"
                    value={formData.name}
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
                <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2">
                  Select Designation
                </label>
                <div className="relative group">
                  <select
                    id="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none glow-input transition-all font-bold tracking-wider text-sm appearance-none cursor-pointer"
                  >
                    <option value="RANGER">INFANTRY RANGER</option>
                    <option value="ENGINEER">ZORD ENGINEER</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                    <svg
                      className="w-4 h-4 fill-current dynamic-text"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                        fillRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-widest mb-3">
                  Select Power Source (Themes UI)
                </label>
                <div className="flex gap-4 justify-start flex-wrap">
                  {colors.map((color) => (
                    <div
                      key={color.name}
                      className={`color-orb ${
                        selectedColor === color.hex ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color.hex, color: color.hex }}
                      onClick={() => handleColorSelect(color)}
                      title={color.name}
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
                    onFocus={() => setShowPasswordRules(true)}
                    onBlur={() => setShowPasswordRules(false)}
                    required
                    maxLength="12" /* Limit to 12 chars */
                    className={`w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none glow-input transition-all placeholder-gray-600 font-bold tracking-wider text-sm ${
                      passwordError ? "input-error" : ""
                    }`}
                  />
                  {/* Validation Message: Shows Red Error if invalid, or Helper Text if empty/focused */}
                  {passwordError ? (
                    <div className="helper-text text-error">
                      {passwordError}
                    </div>
                  ) : showPasswordRules ? (
                    <div className="helper-text dynamic-text">
                      REQ: 8-12 CHARS, 1 UPPER, 1 DIGIT, 1 SPECIAL
                    </div>
                  ) : null}
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
                  disabled={loading || passwordError}
                  className="w-full neon-button text-white font-black py-4 rounded-xl uppercase tracking-[0.15em] text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={
                    loading
                      ? { background: "#22c55e", boxShadow: "0 0 30px #22c55e" }
                      : {}
                  }
                >
                  {loading ? "ACCESS GRANTED" : "INITIATE TRANSFORMATION"}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">Already active?</p>
                <Link
                  to="/login"
                  className="dynamic-text hover:text-white transition-colors text-sm uppercase tracking-widest border-b border-transparent hover:border-white pb-1 mt-1 inline-block"
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
