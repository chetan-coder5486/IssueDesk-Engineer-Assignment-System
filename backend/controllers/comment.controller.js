import Comment from '../models/comment.model.js';
import Ticket from '../models/ticket.model.js';
import { io } from '../main.js';

// Helper to check if user can access a ticket's comments
const canAccessTicketComments = (user, ticket) => {
    if (user.role === 'ADMIN') return true;
    if (user.role === 'ENGINEER' && ticket.assignee?.toString() === user.id.toString()) return true;
    if (user.role === 'RANGER' && ticket.reporter?.toString() === user.id.toString()) return true;
    return false;
};

// Get all comments for a ticket
export const getComments = async (req, res) => {
    try {
        const { ticketId } = req.params;

        // Verify ticket exists and user has access
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found', success: false });
        }

        // Check if user can view this ticket's comments
        if (!canAccessTicketComments(req.user, ticket)) {
            return res.status(403).json({
                message: 'Access denied. You can only view comments on tickets you reported or are assigned to.',
                success: false
            });
        }

        const comments = await Comment.find({ ticketId })
            .populate('author', 'name email department role')
            .sort({ createdAt: 1 }); // Oldest first for chat-like experience
        return res.status(200).json({ comments, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch comments', error: error.message, success: false });
    }
};

// Add a comment to a ticket
export const addComment = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Comment content is required', success: false });
        }

        // Verify ticket exists
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found', success: false });
        }

        // Check if user can comment on this ticket
        if (!canAccessTicketComments(req.user, ticket)) {
            return res.status(403).json({
                message: 'Access denied. You can only comment on tickets you reported or are assigned to.',
                success: false
            });
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

        return res.status(201).json({ message: 'Comment added', comment, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to add comment', error: error.message, success: false });
    }
};

// Edit a comment (author only)
export const editComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Comment content is required', success: false });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found', success: false });
        }

        // Check if user is the author (only author can edit, not even admin)
        if (comment.author.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'Access denied. You can only edit your own comments.',
                success: false
            });
        }

        const ticketId = comment.ticketId;
        comment.content = content.trim();
        await comment.save();
        await comment.populate('author', 'name email department role');

        // Emit socket event for real-time update
        io.to(`ticket_${ticketId}`).emit('comment_updated', comment);

        return res.status(200).json({ message: 'Comment updated', comment, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update comment', error: error.message, success: false });
    }
};

// Delete a comment (author or admin only)
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const comment = await Comment.findById(commentId).populate('author');
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found', success: false });
        }

        // Check if user is the author OR an admin
        const isAuthor = comment.author._id.toString() === userId.toString();
        const isAdmin = userRole === 'ADMIN';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({
                message: 'Access denied. You can only delete your own comments.',
                success: false
            });
        }

        const ticketId = comment.ticketId;
        await Comment.findByIdAndDelete(commentId);

        // Emit socket event for real-time update
        io.to(`ticket_${ticketId}`).emit('comment_deleted', { commentId, ticketId });

        return res.status(200).json({ message: 'Comment deleted', success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete comment', error: error.message, success: false });
    }
};
