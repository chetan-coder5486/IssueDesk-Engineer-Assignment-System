const SLASchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Critical Zord Repair"
  rules: [{
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    resolutionTimeHours: { type: Number, required: true }, // e.g., Critical = 2 hours
    escalationContact: { type: String } // Email/ID to notify if breached
  }]
});