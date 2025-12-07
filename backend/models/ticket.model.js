import mongoose from 'mongoose';


const TicketSchema = new mongoose.Schema({
  // Identification
  title: { type: String, required: true, index: true }, // Indexed for search
  description: { type: String },
  
  // Categorization (Triggers Assignment Logic)
  category: { type: String, required: true }, 
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 
    default: 'MEDIUM' 
  },

  // Workflow State Machine
  status: { 
    type: String, 
    enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN',
    index: true // Indexed for Dashboard filters
  },

  // Relationships
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // SLA & Time Management
  slaPolicyId: { type: mongoose.Schema.Types.ObjectId, ref: 'SLA' },
  dueDate: { type: Date }, // Calculated based on Priority + SLA Policy
  breached: { type: Boolean, default: false },
  
  // Meta
  tags: [{ type: String }] // e.g., ["Hardware", "Fire-Hazard"]
}, { timestamps: true });

export default mongoose.model('Ticket', TicketSchema);