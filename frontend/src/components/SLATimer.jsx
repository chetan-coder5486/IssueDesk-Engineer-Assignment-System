import React, { useState, useEffect } from "react";

/**
 * SLA Timer Component - Shows countdown timer with visual indicators
 * @param {string} dueDate - ISO date string for SLA due date
 * @param {string} status - Current ticket status
 * @param {boolean} breached - Whether ticket is already marked as breached
 * @param {string} size - 'sm' | 'md' | 'lg' for different display sizes
 */
const SLATimer = ({ dueDate, status, breached, size = "md" }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!dueDate) return;

    // Don't show timer for resolved/closed tickets
    if (["RESOLVED", "CLOSED"].includes(status)) {
      return;
    }

    const calculateRemaining = () => {
      const now = Date.now();
      const due = new Date(dueDate).getTime();
      const remaining = due - now;
      setTimeRemaining(remaining);
      setIsExpired(remaining < 0);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dueDate, status]);

  // Don't show for resolved/closed tickets
  if (["RESOLVED", "CLOSED"].includes(status)) {
    return <span className="text-green-400 text-sm">✓ Completed</span>;
  }

  if (!dueDate) {
    return <span className="text-gray-500 text-sm">No SLA</span>;
  }

  const formatTime = (ms) => {
    const absMs = Math.abs(ms);
    const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Determine urgency level
  const getUrgencyLevel = () => {
    if (isExpired || breached) return "critical";
    const hoursRemaining = timeRemaining / (1000 * 60 * 60);
    if (hoursRemaining <= 1) return "critical";
    if (hoursRemaining <= 4) return "warning";
    if (hoursRemaining <= 8) return "caution";
    return "normal";
  };

  const urgency = getUrgencyLevel();

  const urgencyStyles = {
    critical: "bg-red-900/50 border-red-500 text-red-400",
    warning: "bg-orange-900/50 border-orange-500 text-orange-400",
    caution: "bg-yellow-900/50 border-yellow-500 text-yellow-400",
    normal: "bg-blue-900/30 border-blue-500/50 text-blue-400",
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  const pulseClass = urgency === "critical" ? "animate-pulse" : "";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded border ${urgencyStyles[urgency]} ${sizeStyles[size]} ${pulseClass}`}
    >
      {/* Timer Icon */}
      <svg
        className={`w-3.5 h-3.5 ${
          urgency === "critical" ? "animate-spin-slow" : ""
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      {/* Time Display */}
      <span className="font-mono font-medium">
        {isExpired || breached ? (
          <>-{formatTime(timeRemaining)}</>
        ) : (
          formatTime(timeRemaining)
        )}
      </span>

      {/* Status Label */}
      {(isExpired || breached) && (
        <span className="text-[10px] uppercase tracking-wider opacity-80">
          BREACHED
        </span>
      )}
    </div>
  );
};

export default SLATimer;
