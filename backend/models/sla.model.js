import mongoose from 'mongoose';

const SLASchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Default SLA Policy"
  rules: [{
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    resolutionTimeHours: { type: Number, required: true }, // e.g., Critical = 4 hours
    escalationContact: { type: String } // Email/ID to notify if breached
  }],
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

// Default SLA resolution times (in hours) based on priority
export const DEFAULT_SLA_HOURS = {
  CRITICAL: 4,    // 4 hours
  HIGH: 8,        // 8 hours (1 business day)
  MEDIUM: 24,     // 24 hours
  LOW: 72         // 72 hours (3 days)
};

// Calculate due date based on priority
export const calculateDueDate = (priority, createdAt = new Date()) => {
  const hours = DEFAULT_SLA_HOURS[priority] || DEFAULT_SLA_HOURS.MEDIUM;
  const dueDate = new Date(createdAt);
  dueDate.setHours(dueDate.getHours() + hours);
  return dueDate;
};

// Check if a ticket is breached (only if not resolved/closed)
export const isBreached = (dueDate, status) => {
  if (!dueDate) return false;
  if (['RESOLVED', 'CLOSED'].includes(status)) return false;
  return new Date() > new Date(dueDate);
};

// Get time remaining in milliseconds (negative if breached)
export const getTimeRemaining = (dueDate) => {
  if (!dueDate) return null;
  return new Date(dueDate).getTime() - Date.now();
};

// Format time remaining as human readable string
export const formatTimeRemaining = (dueDate) => {
  const remaining = getTimeRemaining(dueDate);
  if (remaining === null) return 'No SLA';

  const absRemaining = Math.abs(remaining);
  const hours = Math.floor(absRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((absRemaining % (1000 * 60 * 60)) / (1000 * 60));

  if (remaining < 0) {
    return `Breached by ${hours}h ${minutes}m`;
  }
  return `${hours}h ${minutes}m remaining`;
};

export default mongoose.model('SLA', SLASchema);