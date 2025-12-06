const WorkflowSchema = new mongoose.Schema({
  name: { type: String, default: 'Standard Incident Flow' },
  transitions: [{
    from: { type: String, required: true }, // e.g., "OPEN"
    to: { type: String, required: true },   // e.g., "ASSIGNED"
    requiredRole: [{ type: String }],       // e.g., ["COMMANDER", "ENGINEER"]
    triggerAction: { type: String }         // e.g., "APPROVE", "CLAIM"
  }]
});