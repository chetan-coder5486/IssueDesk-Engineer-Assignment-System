import Comment from '../models/comment.model.js';
import Ticket from '../models/ticket.model.js';
import { io } from '../main.js';

// Get all comments for a ticket
export const getComments = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const comments = await Comment.find({ ticketId })
            .populate('author', 'name email department role')
            .sort({ createdAt: 1 }); // Oldest first for chat-like experience
        return res.status(200).json({ comments });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch comments', error: error.message });
    }
};

// Add a comment to a ticket
export const addComment = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        // Verify ticket exists
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const comment = new Comment({
            ticketId,
            author: userId,
            content: content.trim()
        });

        await comment.save();
        await comment.populate('author', 'name email department role');

        // Emit socket event for real-time update
        io.to(`ticket_${ticketId}`).emit('new_comment', comment);

        return res.status(201).json({ message: 'Comment added', comment });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to add comment', error: error.message });
    }
};

// Edit a comment (author only)
export const editComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user is the author
        if (comment.author.toString() !== userId) {
            return res.status(403).json({ message: 'You can only edit your own comments' });
        }

        const ticketId = comment.ticketId;
        comment.content = content.trim();
        await comment.save();
        await comment.populate('author', 'name email department role');

        // Emit socket event for real-time update
        io.to(`ticket_${ticketId}`).emit('comment_updated', comment);

        return res.status(200).json({ message: 'Comment updated', comment });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update comment', error: error.message });
    }
};

// Delete a comment (author or admin only)
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId).populate('author');
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user is the author (admin check can be added later)
        if (comment.author._id.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own comments' });
        }

        const ticketId = comment.ticketId;
        await Comment.findByIdAndDelete(commentId);

        // Emit socket event for real-time update
        io.to(`ticket_${ticketId}`).emit('comment_deleted', { commentId, ticketId });

        return res.status(200).json({ message: 'Comment deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete comment', error: error.message });
    }
};
