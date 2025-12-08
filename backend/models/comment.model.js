import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true,
        index: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    }
}, { timestamps: true });

// Index for efficient queries - newest first
CommentSchema.index({ ticketId: 1, createdAt: -1 });

export default mongoose.model('Comment', CommentSchema);
