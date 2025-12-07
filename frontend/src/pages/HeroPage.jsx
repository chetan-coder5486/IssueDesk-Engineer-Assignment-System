import React from "react";
import "./HeroPage.css";
import { Link } from "react-router-dom";

export default function HeroPage({ onStart }) {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1 className="hero-title">WELCOME TO THE GRID</h1>
        <h2 className="hero-subtitle">RECRUIT • TRANSFORM • PROTECT</h2>

        <p className="hero-text">
          Step into the command grid and join the ranks of elite rangers.
          Harness cosmic energy, complete missions, and defend the universe.
        </p>

      <Link to="/login">
        <button className="hero-btn" onClick={onStart}>
          ENTER COMMAND CENTER
        </button>
      </Link>
      </div>

      <div className="hero-glow"></div>
      <div className="hero-stars"></div>
    </div>
  );
}
