import React from "react";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="nav-container">
      <div className="nav-left">
        <h1 className="nav-logo">COMMAND GRID</h1>
      </div>

      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#mission">Mission</a></li>
        <li><a href="#rangers">Rangers</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      <button className="nav-login-btn">Login</button>
    </nav>
  );
}
