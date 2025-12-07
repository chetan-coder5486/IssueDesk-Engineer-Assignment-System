const AuditLogSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., "STATUS_CHANGE", "COMMENT_ADDED", "SLA_BREACH"
  
  // Snapshot of change
  previousValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  
  metadata: { type: String } // Human readable message: "Alpha 5 changed status to Resolved"
}, { timestamps: { createdAt: true, updatedAt: false } });